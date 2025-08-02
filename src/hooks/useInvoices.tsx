
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  invoice_number: string;
  amount_paid: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  paid_at: string;
  invoice_status: 'paid' | 'failed' | 'pending';
  invoice_pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching invoices for user:', user.id);

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: "Error Loading Invoices",
          description: "Failed to load your invoice history. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Invoices fetched:', data);
      // Type assertion to ensure invoice_status is properly typed
      const typedInvoices = (data || []).map(invoice => ({
        ...invoice,
        invoice_status: invoice.invoice_status as 'paid' | 'failed' | 'pending'
      }));
      setInvoices(typedInvoices);

    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading invoices.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    if (!invoice.invoice_pdf_url) {
      toast({
        title: "Invoice Not Available",
        description: "The invoice is not available yet. Please generate it first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = invoice.invoice_pdf_url;
      link.download = `${invoice.invoice_number}.html`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Invoice ${invoice.invoice_number} is being downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch invoices when user changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchInvoices();
    } else if (!authLoading && !user) {
      setLoading(false);
      setInvoices([]);
    }
  }, [user, authLoading]);

  return {
    invoices,
    loading,
    fetchInvoices,
    downloadInvoice,
  };
};
