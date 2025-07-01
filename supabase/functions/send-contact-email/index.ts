
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

    // Send notification email to support
    const supportEmailResponse = await resend.emails.send({
      from: "SleepyBaby Contact Form <onboarding@resend.dev>",
      to: ["support@sleepybabyy.com"],
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
    });

    console.log("Support email sent:", supportEmailResponse);

    // Send confirmation email to user
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

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Contact form submitted successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to send message", 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
