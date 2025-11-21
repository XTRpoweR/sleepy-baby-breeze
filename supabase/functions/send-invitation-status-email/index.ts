import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationStatusEmailRequest {
  invitationId: string;
  status: 'accepted' | 'declined';
  acceptedByEmail?: string;
  acceptedByName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[INVITATION-STATUS-EMAIL] Function started');

    const rawBody = await req.json().catch(() => null);
    console.log('[INVITATION-STATUS-EMAIL] Raw request body:', rawBody);

    const payload = rawBody && typeof rawBody === 'object' && 'body' in rawBody
      ? (rawBody as { body: InvitationStatusEmailRequest }).body
      : (rawBody as InvitationStatusEmailRequest | null) || {};

    const { invitationId, status, acceptedByEmail, acceptedByName }: InvitationStatusEmailRequest = payload as InvitationStatusEmailRequest;

    console.log('[INVITATION-STATUS-EMAIL] Parsed request data:', { invitationId, status, acceptedByEmail });

    if (!invitationId || !status) {
      console.error('[INVITATION-STATUS-EMAIL] Missing required fields');
      return new Response(
        JSON.stringify({ error: "Missing required fields: invitationId and status" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[INVITATION-STATUS-EMAIL] Fetching invitation details');

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*, baby_id')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('[INVITATION-STATUS-EMAIL] Error fetching invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('[INVITATION-STATUS-EMAIL] Invitation found, fetching related data');

    // Get baby name
    const { data: baby, error: babyError } = await supabase
      .from('baby_profiles')
      .select('name')
      .eq('id', invitation.baby_id)
      .single();

    // Get inviter's profile (person who sent the invitation)
    const { data: inviterProfile, error: inviterError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', invitation.invited_by)
      .single();

    if (inviterError || !inviterProfile?.email) {
      console.error('[INVITATION-STATUS-EMAIL] Error fetching inviter profile:', inviterError);
      return new Response(
        JSON.stringify({ error: "Inviter profile not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const babyName = baby?.name || 'your baby';
    const inviterName = inviterProfile.full_name || 'there';
    const respondentName = acceptedByName || acceptedByEmail || invitation.email;

    console.log('[INVITATION-STATUS-EMAIL] Preparing email');

    // Prepare email content based on status
    let subject: string;
    let htmlContent: string;

    if (status === 'accepted') {
      subject = `${respondentName} accepted your family sharing invitation!`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Invitation Accepted!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${inviterName},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Great news! <strong>${respondentName}</strong> has accepted your invitation to join <strong>${babyName}'s</strong> family sharing.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                They now have <strong>${invitation.role}</strong> access and can start viewing and tracking ${babyName}'s activities.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #059669;">
                  <strong>Role:</strong> ${invitation.role}<br>
                  <strong>Email:</strong> ${invitation.email}
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This is an automated message from BabySteps. If you have any questions, please contact support.
              </p>
            </div>
          </body>
        </html>
      `;
    } else {
      subject = `${respondentName} declined your family sharing invitation`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">❌ Invitation Declined</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${inviterName},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${respondentName}</strong> has declined your invitation to join <strong>${babyName}'s</strong> family sharing.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You can send a new invitation if you'd like to try again, or reach out to them directly.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #dc2626;">
                  <strong>Email:</strong> ${invitation.email}<br>
                  <strong>Role offered:</strong> ${invitation.role}
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This is an automated message from BabySteps. If you have any questions, please contact support.
              </p>
            </div>
          </body>
        </html>
      `;
    }

    console.log('[INVITATION-STATUS-EMAIL] Sending email to:', inviterProfile.email);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "BabySteps <onboarding@resend.dev>",
      to: [inviterProfile.email],
      subject: subject,
      html: htmlContent,
    });

    console.log('[INVITATION-STATUS-EMAIL] Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification email sent successfully",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('[INVITATION-STATUS-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);