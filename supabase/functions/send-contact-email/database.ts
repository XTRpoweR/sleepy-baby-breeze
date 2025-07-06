
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { ContactFormData } from './types.ts';

export async function storeContactSubmission(formData: ContactFormData): Promise<boolean> {
  console.log('Storing contact form data in database');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Store the contact form submission with subject as primary identifier
  const messageText = `Subject: ${formData.subject} - From: ${formData.name} (${formData.email})

📧 Contact Details:
   • Name: ${formData.name}
   • Email: ${formData.email}
   • Category: ${formData.category}

💬 Message:
${formData.message}

════════════════════════════════════════`;
  
  const { error: dbError } = await supabase
    .from('user_queries')
    .insert({
      email: formData.email,
      message_text: messageText,
      user_id: null // Since this is from a contact form, user might not be logged in
    });

  if (dbError) {
    console.error('Database error:', dbError);
    return false;
  } else {
    console.log('Contact form data successfully stored in database');
    return true;
  }
}
