import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
        reply_to: formData.email,
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
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Contact Message</title></head>
<body style="margin:0;padding:0;background-color:#f6f8fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f8fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px 24px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">
            <img src="https://sleepybabyy.com/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy" style="height:40px;width:auto;" />
          </td>
        </tr>
        <tr>
          <td style="background-color:#eef4ff;padding:20px 24px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#1e40af;">📩 New Contact Message</p>
            <p style="margin:4px 0 0;font-size:13px;color:#64748b;">SleepyBabyy Support Inbox</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:6px 0;color:#64748b;width:90px;">From:</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${formData.name}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Email:</td><td style="padding:6px 0;"><a href="mailto:${formData.email}" style="color:#2563eb;text-decoration:none;">${formData.email}</a></td></tr>
              ${formData.category ? `<tr><td style="padding:6px 0;color:#64748b;">Category:</td><td style="padding:6px 0;color:#0f172a;">${formData.category}</td></tr>` : ''}
              <tr><td style="padding:6px 0;color:#64748b;">Subject:</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${formData.subject}</td></tr>
            </table>

            <div style="margin-top:20px;padding:16px 18px;background-color:#f0f7ff;border-left:4px solid #3b82f6;border-radius:8px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">User Message</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${safeMessage}</p>
            </div>

            <p style="margin:20px 0 0;font-size:13px;color:#64748b;">↩️ Reply directly to this email to respond to <strong style="color:#0f172a;">${formData.name}</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#fafafa;padding:14px 24px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">SleepyBabyy Support · <a href="https://sleepybabyy.com" style="color:#94a3b8;text-decoration:none;">sleepybabyy.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      console.log("Support email sent successfully:", supportEmailResponse);

      // ===== Confirmation Email to User =====
      const userEmailResponse = await resend.emails.send({
        from: "SleepyBabyy Support <support@sleepybabyy.com>",
        to: [formData.email],
        subject: `We received your message - ${formData.subject}`,
        reply_to: "support@sleepybabyy.com",
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
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>We received your message</title></head>
<body style="margin:0;padding:0;background-color:#f6f8fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f8fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <!-- Logo Header -->
        <tr>
          <td style="background-color:#ffffff;padding:24px 24px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">
            <img src="https://sleepybabyy.com/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy" style="height:40px;width:auto;" />
          </td>
        </tr>
        <tr>
          <td style="background-color:#ecfdf5;padding:20px 24px;border-bottom:1px solid #e5e7eb;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#047857;">✅ We received your message</p>
            <p style="margin:4px 0 0;font-size:13px;color:#64748b;">A member of our team will reply within 24 hours.</p>
          </td>
        </tr>`,
133:         <tr>
134:           <td style="padding:24px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1f2937;">Hi <strong>${formData.name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">Thank you for contacting <strong style="color:#0f172a;">SleepyBabyy</strong>. We've received your message and will get back to you as soon as possible.</p>

            <div style="margin:20px 0;padding:16px 18px;background-color:#f0f7ff;border-left:4px solid #3b82f6;border-radius:8px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">👤 Your Message</p>
              <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong style="color:#0f172a;">Subject:</strong> ${formData.subject}</p>
              ${formData.category ? `<p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong style="color:#0f172a;">Category:</strong> ${formData.category}</p>` : ''}
              <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${safeMessage}</p>
            </div>

            <div style="margin:20px 0;padding:16px 18px;background-color:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#047857;text-transform:uppercase;letter-spacing:0.5px;">💬 Support Team Response</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">Our team is reviewing your message and will reply directly to this email thread within <strong style="color:#0f172a;">24 hours</strong>.</p>
            </div>

            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;">Need quick answers? Visit our <a href="https://sleepybabyy.com/help" style="color:#2563eb;text-decoration:none;font-weight:500;">Help Center</a>.</p>

            <p style="margin:20px 0 0;font-size:14px;color:#475569;">Best regards,<br><strong style="color:#0f172a;">The SleepyBabyy Support Team</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#fafafa;padding:16px 24px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;"><a href="https://sleepybabyy.com" style="color:#94a3b8;text-decoration:none;">sleepybabyy.com</a> · <a href="mailto:support@sleepybabyy.com" style="color:#94a3b8;text-decoration:none;">support@sleepybabyy.com</a></p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">You received this email because you contacted us through sleepybabyy.com. <a href="https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(formData.email)}" style="color:#94a3b8;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      console.log("User confirmation email sent:", userEmailResponse);
      return { success: true };
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
}