import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = 'SleepyBabyy <noreply@sleepybabyy.com>';
const SUPPORT = 'support@sleepybabyy.com';
const SITE = 'https://sleepybabyy.com';

type EmailType =
  | 'trial_started'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_cancelled';

interface Payload {
  type: EmailType;
  to: string;
  name?: string | null;
  tier?: string | null;
  trial_end?: string | null;
  amount?: number | null;
  currency?: string | null;
  invoice_url?: string | null;
  period_end?: string | null;
}

function tierLabel(tier?: string | null) {
  if (tier === 'premium_annual') return 'Premium Annual';
  if (tier === 'premium_quarterly') return 'Premium Quarterly';
  return 'Premium Monthly';
}

function fmtDate(iso?: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

function shell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fb;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:28px 32px;text-align:center;color:#ffffff;">
          <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">SleepyBabyy 🌙</p>
        </td></tr>
        <tr><td style="padding:32px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:20px 32px;text-align:center;font-size:12px;color:#6b7280;">
          <p style="margin:0 0 4px;">Need help? Email <a href="mailto:${SUPPORT}" style="color:#7c3aed;text-decoration:none;">${SUPPORT}</a></p>
          <p style="margin:0;">© ${new Date().getFullYear()} SleepyBabyy · <a href="${SITE}" style="color:#7c3aed;text-decoration:none;">sleepybabyy.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildEmail(p: Payload): { subject: string; html: string } {
  const name = p.name?.trim() || 'there';
  const tier = tierLabel(p.tier);

  switch (p.type) {
    case 'trial_started': {
      const end = fmtDate(p.trial_end);
      return {
        subject: `Your 7-day free trial has started 🎉`,
        html: shell('Trial started', `
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Welcome, ${name}!</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Your <strong>${tier}</strong> free trial is now active. You have full access to all premium features for <strong>7 days</strong>, completely free.</p>
          ${end ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Your trial ends on <strong>${end}</strong>. You won't be charged until then, and you can cancel anytime from your dashboard.</p>` : ''}
          <p style="text-align:center;margin:24px 0;">
            <a href="${SITE}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">Open Dashboard</a>
          </p>
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">Sweet dreams and happy tracking! 💜</p>
        `),
      };
    }
    case 'payment_succeeded': {
      const amt = p.amount != null ? `${(p.currency || 'USD').toUpperCase()} ${p.amount.toFixed(2)}` : '';
      const next = fmtDate(p.period_end);
      return {
        subject: `Payment received — thank you!`,
        html: shell('Payment received', `
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Thanks, ${name}! 💜</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">We've received your payment for <strong>${tier}</strong>${amt ? ` (<strong>${amt}</strong>)` : ''}.</p>
          ${next ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Your subscription is active until <strong>${next}</strong>.</p>` : ''}
          ${p.invoice_url ? `<p style="text-align:center;margin:24px 0;">
            <a href="${p.invoice_url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">View Invoice</a>
          </p>` : ''}
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">You can manage your subscription anytime from your dashboard.</p>
        `),
      };
    }
    case 'payment_failed': {
      return {
        subject: `Action required: payment failed`,
        html: shell('Payment failed', `
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Hi ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">We weren't able to process your payment for <strong>${tier}</strong>. This usually happens when a card has expired or has insufficient funds.</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Please update your payment method to keep your premium access.</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${SITE}/dashboard" style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">Update Payment Method</a>
          </p>
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">If you need help, just reply to this email.</p>
        `),
      };
    }
    case 'subscription_cancelled': {
      const end = fmtDate(p.period_end);
      return {
        subject: `Your subscription has been cancelled`,
        html: shell('Subscription cancelled', `
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Hi ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Your <strong>${tier}</strong> subscription has been cancelled.</p>
          ${end ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">You'll continue to have access to premium features until <strong>${end}</strong>.</p>` : ''}
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">We're sad to see you go. If there's anything we could have done better, we'd love to hear from you.</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${SITE}/pricing" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">Resubscribe</a>
          </p>
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">Thank you for being part of SleepyBabyy. 💜</p>
        `),
      };
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as Payload;

    if (!payload?.type || !payload?.to) {
      return new Response(JSON.stringify({ error: 'type and to are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html } = buildEmail(payload);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [payload.to],
        subject,
        html,
        reply_to: SUPPORT,
      }),
    });

    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      console.error('Resend error', res.status, data);
      return new Response(JSON.stringify({ error: 'send_failed', status: res.status, details: data }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Email sent', { type: payload.type, to: payload.to });
    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-subscription-email error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
