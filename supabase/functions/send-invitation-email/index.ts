
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': 'default-src \'self\'',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting store
const rateLimitStore = new Map();

function checkRateLimit(key: string, limit: number = 10, windowMs: number = 300000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key).filter((time: number) => time > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '')
                .trim()
                .slice(0, 500);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    const allowedKeys = ['invitationId', 'email', 'babyName', 'inviterName', 'role', 'invitationToken'];
    for (const key of Object.keys(input)) {
      if (allowedKeys.includes(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response('Rate limit exceeded', { 
        status: 429, 
        headers: corsHeaders 
      });
    }

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response('Email service not configured', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get and validate user
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Invalid token', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Parse and sanitize request body
    let body;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.length > 5000) {
        throw new Error('Invalid request body size');
      }
      body = sanitizeInput(JSON.parse(rawBody));
    } catch (error) {
      return new Response('Invalid request body', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const { invitationId, email, babyName, inviterName, role, invitationToken } = body;

    // Validate required fields
    if (!invitationId || !email || !babyName || !inviterName || !role || !invitationToken) {
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response('Invalid email format', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Verify the invitation exists and belongs to the user
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invited_by', user.id)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return new Response('Invitation not found or unauthorized', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Create invitation link
    const baseUrl = 'https://sleepybabyy.com';
    const invitationLink = `${baseUrl}/invitation?token=${invitationToken}`;

    // Send email using Resend
    const emailData = {
      from: 'SleepyBabyy <invitations@sleepybabyy.com>',
      to: [email],
      subject: `You're invited to join ${babyName}'s family on SleepyBabyy!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Family Invitation - SleepyBabyy</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi there!</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${babyName}'s</strong> family on SleepyBabyy!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Your role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              As a ${role}, you'll be able to ${role === 'caregiver' ? 'add and edit activities' : 'view all activities'} for ${babyName}.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This invitation will expire in 7 days. If you're unable to click the button above, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #888; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${invitationLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #888; margin: 0 0 8px 0;">
                This invitation was sent by ${inviterName} through SleepyBabyy.
              </p>
              <p style="font-size: 12px; color: #888; margin: 0 0 12px 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="font-size: 12px; color: #888; margin: 0;">
                Questions? <a href="mailto:support@sleepybabyy.com" style="color: #667eea; text-decoration: none;">support@sleepybabyy.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', response.status, errorText);
      throw new Error('Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return new Response('Failed to send invitation email', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
