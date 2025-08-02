import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, DollarSign, Clock, RefreshCcw, Eye, AlertCircle } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const BillingInvoicesTab = () => {
  const { invoices, loading, downloadInvoice, fetchInvoices } = useInvoices();
  const { toast } = useToast();

  const handleRefreshInvoices = async () => {
    try {
      await fetchInvoices();
      toast({
        title: "Invoices Refreshed",
        description: "Your invoice history has been updated.",
      });
    } catch (error) {
      console.error('Error refreshing invoices:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh invoices. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async (invoice: any) => {
    try {
      toast({
        title: "Generating Invoice PDF",
        description: "Please wait while we generate your PDF invoice...",
      });

      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { 
          invoiceId: invoice.id,
          invoiceData: invoice 
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      toast({
        title: "PDF Generated Successfully",
        description: "Your invoice PDF has been generated and is ready to view.",
      });

      // Refresh invoices to get the updated PDF URL
      await fetchInvoices();
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF invoice. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = (invoice: any) => {
    if (!invoice.invoice_pdf_url) {
      toast({
        title: "Invoice Not Available",
        description: "The invoice is not available yet. Please generate it first.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a PDF file
    const isPDF = invoice.invoice_pdf_url.endsWith('.pdf');
    
    if (isPDF) {
      // Open PDF in new tab for viewing with proper parameters
      const pdfUrl = `${invoice.invoice_pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&page=1`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Invoice Opened",
        description: `Invoice ${invoice.invoice_number} opened in new tab.`,
      });
    } else {
      // For legacy files, show a warning and still open
      toast({
        title: "Legacy Invoice Format",
        description: "This invoice is in an older format. Please regenerate for best viewing experience.",
        variant: "destructive",
      });
      window.open(invoice.invoice_pdf_url, '_blank');
    }
  };

  const isInvoicePDF = (invoice: any) => {
    return invoice.invoice_pdf_url?.endsWith('.pdf');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Billing & Invoices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading your invoices...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-semibold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-semibold">
                  {invoices.length > 0 ? formatCurrency(
                    invoices.reduce((sum, inv) => sum + inv.amount_paid, 0),
                    invoices[0]?.currency || 'usd'
                  ) : '$0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Payment</p>
                <p className="text-2xl font-semibold text-sm">
                  {invoices.length > 0 ? formatDate(invoices[0].paid_at) : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Invoice History</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshInvoices}
              className="flex items-center space-x-2"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600 mb-4">
                Your payment history and invoices will appear here after you make your first payment.
              </p>
              <p className="text-sm text-gray-500">
                Once you upgrade to Premium, all your invoices will be automatically generated and stored here for easy access.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            invoice.invoice_status
                          )}`}
                        >
                          {invoice.invoice_status.toUpperCase()}
                        </span>
                        {isInvoicePDF(invoice) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                            PDF
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(invoice.amount_paid, invoice.currency)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Paid: {formatDate(invoice.paid_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        <p>Premium Subscription - Monthly Billing</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {invoice.invoice_pdf_url ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoice(invoice)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                          {!isInvoicePDF(invoice) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePDF(invoice)}
                              className="flex items-center space-x-1 text-blue-600"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Upgrade to PDF</span>
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-amber-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span>Processing</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePDF(invoice)}
                            className="flex items-center space-x-1"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Generate PDF</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {invoices.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                Need help with an invoice? Contact{' '}
                <a
                  href="mailto:support@sleepybaby.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  support@sleepybaby.com
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
