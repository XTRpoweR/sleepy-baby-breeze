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

// Rate limiting store (in-memory; for production use Redis)
const rateLimitStore = new Map<string, number[]>();

// Allow max 3 subscription attempts per IP per 10 minutes (prevents spam/abuse)
function checkRateLimit(key: string, limit: number = 3, windowMs: number = 600000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const requests = rateLimitStore.get(key)!.filter((time: number) => time > windowStart);

  if (requests.length >= limit) {
    return false;
  }

  requests.push(now);
  rateLimitStore.set(key, requests);

  // Clean up old entries periodically (every 100 requests roughly)
  if (Math.random() < 0.01) {
    for (const [k, times] of rateLimitStore.entries()) {
      const recent = times.filter(t => t > windowStart);
      if (recent.length === 0) rateLimitStore.delete(k);
      else rateLimitStore.set(k, recent);
    }
  }

  return true;
}

// Stricter email validation (RFC-5322 simplified)
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

interface NewsletterSubscriptionRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Newsletter subscribe function called');

  // Handle CORS preflight requests
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
    // Rate limiting based on IP (prevents spam/abuse of Resend quota)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log('Rate limit exceeded for IP:', clientIP);
      return new Response(JSON.stringify({ error: 'Too many subscription attempts. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate request size before parsing
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) { // 1KB limit
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email }: NewsletterSubscriptionRequest = await req.json();
    console.log('Processing subscription for email:', email);

    // Stricter email validation
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email already exists
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', sanitizedEmail)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', selectError);
      throw selectError;
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return new Response(JSON.stringify({ error: 'You are already subscribed to our newsletter!' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', sanitizedEmail);

        if (updateError) {
          console.error('Error updating subscriber:', updateError);
          throw updateError;
        }
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: sanitizedEmail,
          status: 'active',
          subscribed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting subscriber:', insertError);
        throw insertError;
      }
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: "SleepyBabyy Newsletter <noreply@sleepybabyy.com>",
        to: [sanitizedEmail],
        subject: "Welcome to SleepyBabyy Newsletter! 🌙",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to SleepyBabyy! 🌙</h1>
              <p style="color: #64748b; font-size: 18px;">Thank you for subscribing to our newsletter</p>
            </div>
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
              <h2 style="color: #334155; margin-top: 0;">What to expect:</h2>
              <ul style="color: #475569; line-height: 1.8;">
                <li>🌟 Weekly sleep tips and expert advice</li>
                <li>📚 Early access to new blog articles</li>
                <li>💡 Practical parenting insights</li>
                <li>🎯 Exclusive content just for subscribers</li>
              </ul>
            </div>
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af;">
                <strong>🎉 Welcome Gift:</strong> Check out our 
                <a href="https://sleepybabyy.com/blog" style="color: #2563eb;">latest sleep guides</a> 
                to get started on your journey to better sleep!
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                Sweet dreams ahead! 💤<br>
                The SleepyBabyy Team
              </p>
              <p style="color: #94a3b8; font-size: 12px;">
                You can unsubscribe at any time by clicking the unsubscribe link in our emails.
              </p>
            </div>
          </div>
        `,
      });

      console.log('Welcome email sent successfully to:', sanitizedEmail);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully subscribed! Check your email for a welcome message.'
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
