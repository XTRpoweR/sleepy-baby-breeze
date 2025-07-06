
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { ContactFormData } from './types.ts';
import { storeContactSubmission } from './database.ts';
import { sendSupportEmail, sendUserConfirmationEmail } from './email.ts';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse, 
  createCorsResponse 
} from './response.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact form submission received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", undefined, 405);
  }

  try {
    const formData: ContactFormData = await req.json();
    console.log("Form data received:", { name: formData.name, email: formData.email, category: formData.category });

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return createValidationErrorResponse("Missing required fields");
    }

    // Store the contact form submission (continue even if this fails)
    const dbStored = await storeContactSubmission(formData);

    // Send support email
    const supportEmailResult = await sendSupportEmail(formData);
    
    // Send user confirmation email
    const userEmailResult = await sendUserConfirmationEmail(formData);

    // Determine response based on email delivery success
    if (supportEmailResult.success && userEmailResult.success) {
      return createSuccessResponse("Contact form submitted successfully. You should receive a confirmation email shortly.");
    } else if (supportEmailResult.success && !userEmailResult.success) {
      return createSuccessResponse(
        "Your message was sent successfully, but we couldn't send a confirmation email. We'll still respond to your inquiry within 24 hours.",
        "Confirmation email delivery failed"
      );
    } else if (!supportEmailResult.success && userEmailResult.success) {
      return createSuccessResponse(
        "We received your message and sent you a confirmation. Our team will respond within 24 hours.",
        "Internal email delivery issues detected"
      );
    } else {
      // Both failed - still return success to user but log the issues
      console.error("Both support and user emails failed", { supportEmailResult });
      return createSuccessResponse(
        "Your message was received. If you don't hear back within 24 hours, please try emailing us directly at support@sleepybabyy.com",
        "Email delivery issues detected"
      );
    }

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return createErrorResponse(
      "There was a technical issue. Please try again or email us directly at support@sleepybabyy.com",
      error.message
    );
  }
};

serve(handler);
