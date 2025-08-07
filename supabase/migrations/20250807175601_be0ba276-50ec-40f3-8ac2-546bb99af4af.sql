
-- Remove all invoice-related database components

-- Drop the invoices table (this will also drop its RLS policies automatically)
DROP TABLE IF EXISTS public.invoices CASCADE;

-- Drop the invoice number sequence
DROP SEQUENCE IF EXISTS public.invoice_number_seq CASCADE;

-- Drop the generate_invoice_number function
DROP FUNCTION IF EXISTS public.generate_invoice_number();
