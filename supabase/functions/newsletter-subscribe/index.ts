import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(key: string, limit = 5, windowMs = 600000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  if (!rateLimitStore.has(key)) rateLimitStore.set(key, []);
  const requests = rateLimitStore.get(key)!.filter(t => t > windowStart);
  if (requests.length >= limit) return false;
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

const welcomeEmailHtml = (email: string, unsubscribeUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SleepyBabyy</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(15,23,42,0.08);">
          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);padding:48px 32px;text-align:center;">
              <div style="font-size:48px;line-height:1;margin-bottom:12px;">🌙</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Welcome to SleepyBabyy</h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.92);font-size:16px;">Sweet dreams start here ✨</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 24px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">You're officially in! 🎉</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
                Thanks for subscribing to the SleepyBabyy newsletter. You'll now receive expert tips, science-backed insights, and practical advice to help your little one (and you) sleep better.
              </p>

              <!-- Features -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
                <tr>
                  <td style="padding:14px 0;border-top:1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:22px;">🌟</td>
                        <td>
                          <div style="color:#0f172a;font-size:15px;font-weight:600;margin-bottom:2px;">Weekly sleep tips</div>
                          <div style="color:#64748b;font-size:14px;">Curated advice from pediatric sleep experts</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-top:1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:22px;">📚</td>
                        <td>
                          <div style="color:#0f172a;font-size:15px;font-weight:600;margin-bottom:2px;">Early access to articles</div>
                          <div style="color:#64748b;font-size:14px;">Read new guides before anyone else</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;font-size:22px;">💡</td>
                        <td>
                          <div style="color:#0f172a;font-size:15px;font-weight:600;margin-bottom:2px;">Subscriber-only content</div>
                          <div style="color:#64748b;font-size:14px;">Exclusive guides not published on the blog</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="https://sleepybabyy.com/blog" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(59,130,246,0.35);">
                      Read our latest guides →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 36px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 8px;color:#475569;font-size:14px;">Sweet dreams ahead 💤</p>
              <p style="margin:0 0 16px;color:#0f172a;font-size:14px;font-weight:600;">— The SleepyBabyy Team</p>
              <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;line-height:1.5;">
                You're receiving this because you subscribed at <a href="https://sleepybabyy.com" style="color:#3b82f6;text-decoration:none;">sleepybabyy.com</a><br/>
                Sent to ${email}
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                Don't want these emails? <a href="${unsubscribeUrl}" style="color:#3b82f6;text-decoration:underline;">Unsubscribe instantly</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

interface NewsletterSubscriptionRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Too many subscription attempts. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email }: NewsletterSubscriptionRequest = await req.json();

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingSubscriber, error: selectError } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing subscriber:', selectError);
      throw selectError;
    }

    let isReturning = false;

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        // Friendly: already subscribed is NOT an error.
        return new Response(JSON.stringify({
          success: true,
          alreadySubscribed: true,
          message: "You're already subscribed to our newsletter. Thank you! 💙"
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Reactivate
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', sanitizedEmail);
        if (updateError) throw updateError;
        isReturning = true;
      }
    } else {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: sanitizedEmail,
          status: 'active',
          subscribed_at: new Date().toISOString()
        });
      if (insertError) throw insertError;
    }

    // Send welcome email (non-blocking)
    try {
      const result = await resend.emails.send({
        from: "SleepyBabyy <noreply@sleepybabyy.com>",
        to: [sanitizedEmail],
        subject: isReturning ? "Welcome back to SleepyBabyy 🌙" : "Welcome to SleepyBabyy 🌙",
        html: welcomeEmailHtml(sanitizedEmail),
      });
      console.log('Welcome email sent:', JSON.stringify(result));
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription
    }

    return new Response(JSON.stringify({
      success: true,
      message: isReturning
        ? 'Welcome back! Check your inbox for a confirmation.'
        : 'Successfully subscribed! Check your email for a welcome message.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in newsletter-subscribe function:', error);
    return new Response(JSON.stringify({ error: 'Failed to subscribe to newsletter. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
