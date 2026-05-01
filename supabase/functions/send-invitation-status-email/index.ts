import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
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

// Build branded acceptance email
function buildAcceptedEmail(inviterName: string, respondentName: string, babyName: string, role: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invitation Accepted - SleepyBabyy</title>
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  table, td { border-collapse: collapse; }
  img { border: 0; max-width: 100%; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 12px !important; }
    .hero-card { padding: 28px 20px !important; }
    .headline { font-size: 24px !important; line-height: 32px !important; }
  }
  * { box-sizing: border-box; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F2;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;table-layout:fixed;">
        <tr>
          <td style="padding:24px 32px;">
            <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;">
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" class="hero-card" style="padding:40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">🎉</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;">
                    Great news! Invitation accepted
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;">
                    ${respondentName} just joined ${babyName}'s family
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Hi ${inviterName}! 👋
            </p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              <strong style="color:#7C3AED;">${respondentName}</strong> has accepted your invitation to join <strong>${babyName}'s</strong> family on SleepyBabyy.
            </p>
            <table role="presentation" width="100%" style="margin:24px 0;">
              <tr>
                <td style="background:linear-gradient(135deg,#D1FAE5 0%,#C4B5FD 100%);border-radius:16px;padding:24px;">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#7C3AED;text-transform:uppercase;letter-spacing:1.5px;">
                    ✦ New Family Member
                  </p>
                  <p style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#1E3A8A;">
                    ${role.charAt(0).toUpperCase() + role.slice(1)}
                  </p>
                  <p style="margin:0;font-size:14px;line-height:22px;color:#1F2937;">
                    📧 ${email}
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              They can now ${role === 'caregiver' ? 'add and edit activities' : 'view all activities'} for ${babyName}. Sweet collaborations ahead! 🌙
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 32px 32px 32px;">
            <table role="presentation" align="center" style="margin:0 auto;">
              <tr>
                <td align="center">
                  <a href="https://sleepybabyy.com/family-dashboard" style="background-color:#793BED;background-image:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;box-shadow:0 10px 30px rgba(121,59,237,0.4);">View Family Dashboard &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <p style="margin:0;font-size:16px;line-height:24px;color:#1F2937;">
              Sweet dreams 🌙<br>
              <strong style="color:#7C3AED;">The SleepyBabyy Team</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 32px 32px 32px;">
            <a href="https://www.facebook.com/share/17HFMh4CNE/?mibextid=LQQJ4d" style="text-decoration:none;display:inline-block;margin-bottom:20px;">
              <div style="width:40px;height:40px;background:#1E3A8A;border-radius:50%;text-align:center;line-height:40px;color:#FFFFFF;font-size:18px;font-weight:700;">f</div>
            </a>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 SleepyBabyy. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Build branded declined email
function buildDeclinedEmail(inviterName: string, respondentName: string, babyName: string, role: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invitation Declined - SleepyBabyy</title>
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  table, td { border-collapse: collapse; }
  img { border: 0; max-width: 100%; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 12px !important; }
    .hero-card { padding: 28px 20px !important; }
    .headline { font-size: 24px !important; line-height: 32px !important; }
  }
  * { box-sizing: border-box; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F2;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;table-layout:fixed;">
        <tr>
          <td style="padding:24px 32px;">
            <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;">
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" class="hero-card" style="padding:40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">💌</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;">
                    Invitation update
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;">
                    ${respondentName} declined your invitation
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Hi ${inviterName}! 👋
            </p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              <strong>${respondentName}</strong> has declined your invitation to join <strong>${babyName}'s</strong> family on SleepyBabyy.
            </p>
            <p style="margin:24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              No worries — you can send a new invitation anytime, or reach out to them directly. 💛
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 32px 32px 32px;">
            <table role="presentation" align="center" style="margin:0 auto;">
              <tr>
                <td align="center">
                  <a href="https://sleepybabyy.com/family-dashboard" style="background-color:#793BED;background-image:linear-gradient(135deg,#793BED 0%,#9B27B0 50%,#EC4699 100%);border-radius:100px;color:#FFFFFF;display:inline-block;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;line-height:64px;text-align:center;text-decoration:none;width:300px;box-shadow:0 10px 30px rgba(121,59,237,0.4);">Manage Family &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <p style="margin:0;font-size:16px;line-height:24px;color:#1F2937;">
              Sweet dreams 🌙<br>
              <strong style="color:#7C3AED;">The SleepyBabyy Team</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 32px 32px 32px;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              © 2026 SleepyBabyy. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[INVITATION-STATUS-EMAIL] Function started');
    
    const rawBody = await req.json().catch(() => null);
    const payload = rawBody && typeof rawBody === 'object' && 'body' in rawBody 
      ? (rawBody as { body: InvitationStatusEmailRequest }).body
      : (rawBody as InvitationStatusEmailRequest | null) || {};
    
    const { invitationId, status, acceptedByEmail, acceptedByName }: InvitationStatusEmailRequest = payload as InvitationStatusEmailRequest;

    if (!invitationId || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: invitationId and status" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*, baby_id')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: baby } = await supabase.from('baby_profiles').select('name').eq('id', invitation.baby_id).single();
    const { data: inviterProfile, error: inviterError } = await supabase.from('profiles').select('email, full_name').eq('id', invitation.invited_by).single();

    if (inviterError || !inviterProfile?.email) {
      return new Response(
        JSON.stringify({ error: "Inviter profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const babyName = baby?.name || 'your baby';
    const inviterName = inviterProfile.full_name || 'there';
    const respondentName = acceptedByName || acceptedByEmail || invitation.email;

    let subject: string;
    let htmlContent: string;

    if (status === 'accepted') {
      subject = `🎉 ${respondentName} accepted your invitation!`;
      htmlContent = buildAcceptedEmail(inviterName, respondentName, babyName, invitation.role, invitation.email);
    } else {
      subject = `${respondentName} declined your SleepyBabyy invitation`;
      htmlContent = buildDeclinedEmail(inviterName, respondentName, babyName, invitation.role, invitation.email);
    }

    const emailResponse = await resend.emails.send({
      from: "SleepyBabyy <notifications@sleepybabyy.com>",
      to: [inviterProfile.email],
      subject: subject,
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('[INVITATION-STATUS-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
