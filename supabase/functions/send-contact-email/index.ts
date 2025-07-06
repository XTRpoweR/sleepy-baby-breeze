
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact form submission received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const formData: ContactFormData = await req.json();
    console.log("Form data received:", { name: formData.name, email: formData.email, category: formData.category });

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Supabase client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store the contact form submission in the database with improved formatting
    const messageText = `=== CONTACT FORM SUBMISSION ===

📧 Contact Information:
   • Name: ${formData.name}
   • Email: ${formData.email}
   • Category: ${formData.category}

📝 Subject: ${formData.subject}

💬 Message:
${formData.message}

=== END OF SUBMISSION ===`;
    
    const { error: dbError } = await supabase
      .from('user_queries')
      .insert({
        email: formData.email,
        message_text: messageText,
        user_id: null // Since this is from a contact form, user might not be logged in
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with email sending even if database insert fails
    } else {
      console.log('Contact form data successfully stored in database');
    }

    // Primary and fallback email addresses
    const primaryEmails = ["support@sleepybabyy.com"];
    const fallbackEmails = ["sleepybaby.support@gmail.com"]; // Add your actual fallback email here
    
    let supportEmailSuccess = false;
    let supportEmailError = null;

    // Try to send to primary email addresses first
    try {
      const supportEmailResponse = await resend.emails.send({
        from: "SleepyBaby Contact <noreply@sleepybabyy.com>", // Use your verified domain
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
        reply_to: formData.email, // Allow direct replies
      });

      console.log("Support email sent successfully to primary addresses:", supportEmailResponse);
      supportEmailSuccess = true;
    } catch (error) {
      console.error("Failed to send to primary email addresses:", error);
      supportEmailError = error;
      
      // Try fallback email addresses
      try {
        const fallbackEmailResponse = await resend.emails.send({
          from: "SleepyBaby Contact <onboarding@resend.dev>", // Fallback to verified sender
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
        supportEmailSuccess = true;
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
        // Continue to send user confirmation even if support emails fail
      }
    }

    // Always try to send confirmation email to user
    let userEmailSuccess = false;
    try {
      const userEmailResponse = await resend.emails.send({
        from: "SleepyBaby Support <onboarding@resend.dev>",
        to: [formData.email],
        subject: "We received your message - SleepyBaby Support",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for contacting SleepyBaby!</h2>
            
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
            The SleepyBaby Support Team</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 14px; color: #64748b;">
              SleepyBaby - Helping families get the rest they deserve, one night at a time.
            </p>
          </div>
        `,
      });

      console.log("User confirmation email sent:", userEmailResponse);
      userEmailSuccess = true;
    } catch (userEmailError) {
      console.error("User confirmation email failed:", userEmailError);
    }

    // Determine response based on email delivery success
    if (supportEmailSuccess && userEmailSuccess) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully. You should receive a confirmation email shortly." 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (supportEmailSuccess && !userEmailSuccess) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Your message was sent successfully, but we couldn't send a confirmation email. We'll still respond to your inquiry within 24 hours.",
        warning: "Confirmation email delivery failed"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (!supportEmailSuccess && userEmailSuccess) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "We received your message and sent you a confirmation. Our team will respond within 24 hours.",
        warning: "Internal email delivery issues detected"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      // Both failed - still return success to user but log the issues
      console.error("Both support and user emails failed", { supportEmailError });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Your message was received. If you don't hear back within 24 hours, please try emailing us directly at support@sleepybabyy.com",
        warning: "Email delivery issues detected"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to send message", 
      details: error.message,
      message: "There was a technical issue. Please try again or email us directly at support@sleepybabyy.com"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
