
import { corsHeaders } from './types.ts';

export function createSuccessResponse(message: string, warning?: string): Response {
  const responseData: any = { 
    success: true, 
    message 
  };
  
  if (warning) {
    responseData.warning = warning;
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export function createErrorResponse(message: string, details?: string, status: number = 500): Response {
  const responseData: any = { 
    error: "Failed to send message", 
    message 
  };
  
  if (details) {
    responseData.details = details;
  }

  return new Response(JSON.stringify(responseData), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
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
