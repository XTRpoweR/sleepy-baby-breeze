
import { corsHeaders } from './types.ts';

export function createSuccessResponse(message: string, extraHeaders?: Record<string, string>, warning?: string): Response {
  const responseData: any = { 
    success: true, 
    message 
  };
  
  if (warning) {
    responseData.warning = warning;
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(extraHeaders || {}) },
  });
}

export function createErrorResponse(message: string, status: number = 500, extraHeaders?: Record<string, string>, details?: string): Response {
  const responseData: any = { 
    error: "Failed to send message", 
    message 
  };
  
  if (details) {
    responseData.details = details;
  }

  return new Response(JSON.stringify(responseData), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(extraHeaders || {}) },
  });
}

export function createValidationErrorResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export function createCorsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}
