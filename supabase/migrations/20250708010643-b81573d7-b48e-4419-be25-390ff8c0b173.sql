-- Create password reset verification codes table
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own codes
CREATE POLICY "Users can access their own reset codes" 
ON public.password_reset_codes 
FOR ALL
USING (email = auth.email());

-- Create index for performance
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes(verification_code);
CREATE INDEX idx_password_reset_codes_expires ON public.password_reset_codes(expires_at);