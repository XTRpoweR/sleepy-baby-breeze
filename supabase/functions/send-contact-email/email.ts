import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Build branded support team email
function buildSupportEmail(formData: { name: string; email: string; subject: string; message: string; category?: string }, safeMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Contact Message - SleepyBabyy</title>
<style>
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  table, td { border-collapse: collapse; }
  img { border: 0; max-width: 100%; }
  * { box-sizing: border-box; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F2;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;table-layout:fixed;">
        <tr>
          <td style="padding:24px 32px;">
            <img src="https://sleepybabyy.com/logo.png" alt="SleepyBabyy" width="200" style="display:block;max-width:200px;">
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" width="100%" style="background:#FFFFFF;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,0.08);">
              <tr>
                <td align="center" style="padding:40px;">
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">📩</div>
                  <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;">
                    New Contact Message
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;">
                    From: ${formData.name}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <table role="presentation" width="100%" style="background:#F3F4F6;border-radius:12px;padding:0;">
              <tr>
                <td style="padding:20px;">
                  <table role="presentation" width="100%" style="font-size:14px;">
                    <tr><td style="padding:6px 0;color:#6B7280;width:90px;">From:</td><td style="padding:6px 0;color:#1F2937;font-weight:600;">${formData.name}</td></tr>
                    <tr><td style="padding:6px 0;color:#6B7280;">Email:</td><td style="padding:6px 0;"><a href="mailto:${formData.email}" style="color:#7C3AED;text-decoration:none;font-weight:600;">${formData.email}</a></td></tr>
                    ${formData.category ? `<tr><td style="padding:6px 0;color:#6B7280;">Category:</td><td style="padding:6px 0;color:#1F2937;">${formData.category}</td></tr>` : ''}
                    <tr><td style="padding:6px 0;color:#6B7280;">Subject:</td><td style="padding:6px 0;color:#1F2937;font-weight:600;">${formData.subject}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" style="margin:20px 0;background:linear-gradient(135deg,#FBCFE8 0%,#C4B5FD 100%);border-radius:16px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;color:#7C3AED;text-transform:uppercase;letter-spacing:1.5px;">
                    💬 User Message
                  </p>
                  <p style="margin:0;font-size:14px;line-height:22px;color:#1F2937;white-space:pre-wrap;">${safeMessage}</p>
                </td>
              </tr>
            </table>
            <p style="margin:20px 0 0 0;font-size:14px;color:#6B7280;">
              ↩️ Reply directly to this email to respond to <strong style="color:#1F2937;">${formData.name}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:32px;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
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

// Build branded user confirmation email
function buildUserConfirmationEmail(formData: { name: string; email: string; subject: string; message: string; category?: string }, safeMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>We received your message - SleepyBabyy</title>
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
                  <div style="font-size:56px;line-height:1;margin-bottom:20px;">✅</div>
                  <h1 class="headline" style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:38px;color:#1F2937;">
                    Message received!
                  </h1>
                  <p style="margin:0;font-size:16px;line-height:26px;color:#6B7280;">
                    We'll reply within 24 hours
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Hi ${formData.name}! 👋
            </p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Thank you for contacting <strong style="color:#7C3AED;">SleepyBabyy</strong>. We've received your message and a member of our support team will reply within 24 hours.
            </p>
            <table role="presentation" width="100%" style="margin:24px 0;background:#F3F4F6;border-radius:12px;">
              <tr>
                <td style="padding:20px;">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#7C3AED;text-transform:uppercase;letter-spacing:1.5px;">
                    📝 Your Message
                  </p>
                  <p style="margin:0 0 8px 0;font-size:14px;color:#1F2937;"><strong>Subject:</strong> ${formData.subject}</p>
                  ${formData.category ? `<p style="margin:0 0 8px 0;font-size:14px;color:#1F2937;"><strong>Category:</strong> ${formData.category}</p>` : ''}
                  <p style="margin:8px 0 0 0;font-size:14px;line-height:22px;color:#1F2937;white-space:pre-wrap;">${safeMessage}</p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0;font-size:16px;line-height:26px;color:#1F2937;">
              Need quick answers? Visit our <a href="https://sleepybabyy.com/help" style="color:#7C3AED;text-decoration:none;font-weight:600;">Help Center</a> for instant support. 💡
            </p>
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
            <p style="margin:0 0 12px 0;font-size:13px;line-height:20px;color:#6B7280;">
              <a href="https://sleepybabyy.com/help" style="color:#6B7280;text-decoration:none;">Help</a>
              <span style="color:#D1D5DB;margin:0 8px;">·</span>
              <a href="https://sleepybabyy.com/privacy" style="color:#6B7280;text-decoration:none;">Privacy</a>
            </p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;">
              <a href="https://sleepybabyy.com" style="color:#7C3AED;text-decoration:none;font-weight:600;">🌙 sleepybabyy.com</a>
            </p>
            <p style="margin:0 0 8px 0;font-size:11px;color:#9CA3AF;">
              You received this email because you contacted us through sleepybabyy.com.
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

export class EmailService {
  async sendContactEmail(formData: { name: string; email: string; subject: string; message: string; category?: string }) {
    console.log('Sending contact email');

    try {
      const messageId = `contact-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const safeMessage = formData.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // ===== Email to Support Team =====
      const supportEmailResponse = await resend.emails.send({
        from: "SleepyBabyy Support <support@sleepybabyy.com>",
        to: ["support@sleepybabyy.com"],
        subject: `Contact: ${formData.subject}`,
        replyTo: formData.email,
        headers: {
          'X-Entity-Ref-ID': messageId,
          'List-Unsubscribe': '<mailto:support@sleepybabyy.com?subject=unsubscribe>',
        },
        text: `New contact form submission

From: ${formData.name} <${formData.email}>
${formData.category ? `Category: ${formData.category}\n` : ''}Subject: ${formData.subject}

Message:
${formData.message}

---
Reply directly to this email to respond to ${formData.name}.

SleepyBabyy Support Team
https://sleepybabyy.com`,
        html: buildSupportEmail(formData, safeMessage),
      });
      console.log("Support email sent successfully:", supportEmailResponse);

      // ===== Confirmation Email to User =====
      const userEmailResponse = await resend.emails.send({
        from: "SleepyBabyy Support <support@sleepybabyy.com>",
        to: [formData.email],
        subject: `We received your message - ${formData.subject}`,
        replyTo: "support@sleepybabyy.com",
        headers: {
          'X-Entity-Ref-ID': `${messageId}-confirm`,
          'List-Unsubscribe': `<mailto:support@sleepybabyy.com?subject=unsubscribe>, <https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(formData.email)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        text: `Hi ${formData.name},

Thank you for contacting SleepyBabyy. We have received your message and a member of our team will reply within 24 hours.

Your message:
Subject: ${formData.subject}
${formData.category ? `Category: ${formData.category}\n` : ''}
${formData.message}

If you need quick answers, visit our Help Center: https://sleepybabyy.com/help

Best regards,
The SleepyBabyy Support Team
https://sleepybabyy.com

---
You received this email because you contacted us through sleepybabyy.com.
To unsubscribe: https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(formData.email)}`,
        html: buildUserConfirmationEmail(formData, safeMessage),
      });
      console.log("User confirmation email sent:", userEmailResponse);

      return { success: true };
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
}
