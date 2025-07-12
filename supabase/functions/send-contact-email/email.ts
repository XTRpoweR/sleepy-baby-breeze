
import { Resend } from "npm:resend@2.0.0";
import { ContactFormData, EmailResponse } from './types.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export async function sendSupportEmail(formData: ContactFormData): Promise<EmailResponse> {
  const primaryEmails = ["support@sleepybabyy.com"];
  const fallbackEmails = ["sleepybaby.support@gmail.com"];
  
  try {
    // Try to send to primary email addresses first
    const supportEmailResponse = await resend.emails.send({
      from: "SleepyBabyy Contact <noreply@sleepybabyy.com>",
      to: primaryEmails,
      subject: `New Contact Form: ${formData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">Contact Details</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Category:</strong> ${formData.category}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #334155;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              Reply directly to this email to respond to ${formData.name} at ${formData.email}
            </p>
          </div>
        </div>
      `,
      reply_to: formData.email,
    });

    console.log("Support email sent successfully to primary addresses:", supportEmailResponse);
    return { success: true };
  } catch (error) {
    console.error("Failed to send to primary email addresses:", error);
    
    // Try fallback email addresses
    try {
      const fallbackEmailResponse = await resend.emails.send({
        from: "SleepyBabyy Contact <onboarding@resend.dev>",
        to: fallbackEmails,
        subject: `[FALLBACK] New Contact Form: ${formData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fef3c7; padding: 10px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ This email was sent to fallback address due to delivery issues with primary address.</p>
            </div>
            
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #334155;">Contact Details</h3>
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Category:</strong> ${formData.category}</p>
              <p><strong>Subject:</strong> ${formData.subject}</p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #334155;">Message</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                Reply directly to ${formData.email} to respond to this inquiry.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 8px;">
              <p style="margin: 0; color: #dc2626; font-size: 12px;">
                <strong>Technical Note:</strong> Primary email delivery failed. Please check domain configuration and MX records for ${primaryEmails.join(', ')}.
              </p>
            </div>
          </div>
        `,
        reply_to: formData.email,
      });

      console.log("Fallback email sent successfully:", fallbackEmailResponse);
      return { success: true };
    } catch (fallbackError) {
      console.error("Fallback email also failed:", fallbackError);
      return { success: false, error: fallbackError };
    }
  }
}

export async function sendUserConfirmationEmail(formData: ContactFormData): Promise<EmailResponse> {
  try {
    const userEmailResponse = await resend.emails.send({
      from: "SleepyBabyy Support <onboarding@resend.dev>",
      to: [formData.email],
      subject: "We received your message - SleepyBabyy Support",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for contacting SleepyBabyy!</h2>
          
          <p>Hi ${formData.name},</p>
          
          <p>We've received your message and will get back to you within 24 hours. Here's a copy of what you sent:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p><strong>Category:</strong> ${formData.category}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
          </div>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Need immediate help?</h3>
            <p style="margin-bottom: 0;">
              • Check our <a href="https://sleepybabyy.com/help" style="color: #2563eb;">Help Center</a> for instant answers<br>
              • Premium subscribers can access 24/7 emergency support<br>
              • Our support hours: Monday-Friday 9AM-6PM EST, Saturday 10AM-4PM EST
            </p>
          </div>
          
          <p>Best regards,<br>
          The SleepyBabyy Support Team</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="font-size: 14px; color: #64748b;">
            SleepyBabyy - Helping families get the rest they deserve, one night at a time.
          </p>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);
    return { success: true };
  } catch (userEmailError) {
    console.error("User confirmation email failed:", userEmailError);
    return { success: false, error: userEmailError };
  }
}
