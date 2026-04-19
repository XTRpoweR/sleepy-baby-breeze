
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export class EmailService {
  async sendContactEmail(formData: { name: string; email: string; subject: string; message: string; category?: string }) {
    console.log('Sending contact email');
    
    try {
      // Generate unique message ID for better deliverability
      const messageId = `contact-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Send to support team - plain text heavy for better spam score
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
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<p>Hello Support Team,</p>
<p>You have received a new message from the SleepyBabyy contact form.</p>
<p><strong>From:</strong> ${formData.name} (${formData.email})<br>
${formData.category ? `<strong>Category:</strong> ${formData.category}<br>` : ''}<strong>Subject:</strong> ${formData.subject}</p>
<p><strong>Message:</strong></p>
<p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
<p>You can reply directly to this email to respond to ${formData.name}.</p>
<p>Best regards,<br>SleepyBabyy System</p>
</body>
</html>`,
      });

      console.log("Support email sent successfully:", supportEmailResponse);

      // Send confirmation to user - plain text heavy
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
To unsubscribe from future communications, reply with "unsubscribe" or visit:
https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(formData.email)}`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
<p>Hi ${formData.name},</p>
<p>Thank you for contacting SleepyBabyy. We have received your message and a member of our team will reply within 24 hours.</p>
<p><strong>Your message:</strong><br>
Subject: ${formData.subject}${formData.category ? `<br>Category: ${formData.category}` : ''}</p>
<p style="white-space: pre-wrap;">${formData.message}</p>
<p>If you need quick answers, visit our <a href="https://sleepybabyy.com/help" style="color: #2563eb;">Help Center</a>.</p>
<p>Best regards,<br>The SleepyBabyy Support Team<br><a href="https://sleepybabyy.com" style="color: #2563eb;">sleepybabyy.com</a></p>
<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
<p style="font-size: 12px; color: #888;">You received this email because you contacted us through sleepybabyy.com. To stop receiving these emails, <a href="https://sleepybabyy.com/unsubscribe?email=${encodeURIComponent(formData.email)}" style="color: #888;">unsubscribe here</a>.</p>
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
