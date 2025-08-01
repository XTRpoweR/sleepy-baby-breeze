
-- Create invoices table to store invoice records
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount_paid INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
  invoice_status TEXT NOT NULL DEFAULT 'paid' CHECK (invoice_status IN ('paid', 'failed', 'pending')),
  invoice_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own invoices
CREATE POLICY "Users can view their own invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy for service role to manage invoices (for edge functions)
CREATE POLICY "Service role can manage invoices" 
  ON public.invoices 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1000;

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_date TEXT;
BEGIN
  SELECT nextval('invoice_number_seq') INTO next_number;
  SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MMDD') INTO invoice_date;
  RETURN 'INV-' || invoice_date || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON public.invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_subscription_id ON public.invoices(subscription_id);
