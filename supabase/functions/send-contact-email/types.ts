
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  error?: any;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
