
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { EmailService } from './email.ts';
import { DatabaseService } from './database.ts';
import { validateContactForm, sanitizeInput } from './validation.ts';
import { createErrorResponse, createSuccessResponse } from './response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': 'default-src \'self\'',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

function checkRateLimit(key: string, limit: number = 5, windowMs: number = 300000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key).filter((time: number) => time > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(key, requests);
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405, corsHeaders);
  }

  try {
    // Rate limiting based on IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, corsHeaders);
    }

    // Parse and validate request body
    let body;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.length === 0) {
        return createErrorResponse('Request body is required', 400, corsHeaders);
      }
      
      if (rawBody.length > 10000) { // 10KB limit
        return createErrorResponse('Request body too large', 413, corsHeaders);
      }
      
      body = JSON.parse(rawBody);
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, corsHeaders);
    }

    // Sanitize input
    body = sanitizeInput(body);

    // Validate the contact form data
    const validation = validateContactForm(body);
    if (!validation.isValid) {
      return createErrorResponse(`Validation error: ${validation.errors.join(', ')}`, 400, corsHeaders);
    }

    const { name, email, subject, message, category } = body;

    // Initialize services
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return createErrorResponse('Internal server error', 500, corsHeaders);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const emailService = new EmailService();
    const dbService = new DatabaseService(supabase);

    // Get user ID if authenticated
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (error) {
        // Continue without user ID if token is invalid
        console.log('Invalid auth token, continuing as anonymous');
      }
    }

    // Store the query in database
    await dbService.storeUserQuery({
      user_id: userId,
      email: email,
      message_text: `Subject: ${subject}${category ? `\nCategory: ${category}` : ''}\n\n${message}`
    });

    // Send email
    await emailService.sendContactEmail({
      name,
      email,
      subject,
      message,
      category
    });

    return createSuccessResponse('Message sent successfully', corsHeaders);

  } catch (error) {
    console.error('Error processing contact form:', error);
    return createErrorResponse('Failed to send message. Please try again later.', 500, corsHeaders);
  }
});
