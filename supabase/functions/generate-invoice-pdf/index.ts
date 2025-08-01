
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-INVOICE-PDF] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("PDF generation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { invoiceId, invoiceData, stripeInvoice } = await req.json();

    if (!invoiceId || !invoiceData) {
      throw new Error("Missing required invoice data");
    }

    logStep("Processing invoice", { invoiceId, invoiceNumber: invoiceData.invoice_number });

    // Generate HTML invoice content
    const htmlContent = generateInvoiceHTML(invoiceData, stripeInvoice);

    // For now, we'll create a simple text-based invoice
    // In a production environment, you'd use a proper PDF generation library
    const invoiceContent = `
INVOICE
=======

SleepyBabyy Premium Subscription
Invoice #: ${invoiceData.invoice_number}

Billing Information:
Customer ID: ${invoiceData.user_id}
Invoice Date: ${new Date(invoiceData.paid_at).toLocaleDateString()}
Amount Paid: $${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}

Billing Period:
From: ${new Date(invoiceData.billing_period_start).toLocaleDateString()}
To: ${new Date(invoiceData.billing_period_end).toLocaleDateString()}

Description: SleepyBabyy Premium Monthly Subscription
Quantity: 1
Unit Price: $${(invoiceData.amount_paid / 100).toFixed(2)}
Total: $${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}

Status: PAID
Payment Date: ${new Date(invoiceData.paid_at).toLocaleDateString()}

Thank you for your business!

SleepyBabyy Team
support@sleepybaby.com
    `;

    // Convert to base64 for storage (simulating PDF)
    const base64Content = btoa(unescape(encodeURIComponent(invoiceContent)));
    
    // Store in Supabase Storage
    const fileName = `invoices/${invoiceData.invoice_number}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('baby-memories')
      .upload(fileName, base64Content, {
        contentType: 'text/plain',
        cacheControl: '3600',
      });

    if (uploadError) {
      logStep("ERROR uploading invoice", { error: uploadError.message });
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('baby-memories')
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update invoice record with PDF URL
    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({ 
        invoice_pdf_url: pdfUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    if (updateError) {
      logStep("ERROR updating invoice with PDF URL", { error: updateError.message });
    }

    logStep("PDF generated successfully", { pdfUrl });

    return new Response(JSON.stringify({ 
      success: true, 
      pdfUrl,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "PDF generation failed";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateInvoiceHTML(invoiceData: any, stripeInvoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceData.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .customer-info, .invoice-info { width: 45%; }
        .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background: #f8fafc; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🍼 SleepyBabyy</div>
        <h1>INVOICE</h1>
      </div>

      <div class="invoice-details">
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p>Customer ID: ${invoiceData.user_id}</p>
          <p>Email: Available in account</p>
        </div>
        <div class="invoice-info">
          <h3>Invoice Details:</h3>
          <p><strong>Invoice #:</strong> ${invoiceData.invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(invoiceData.paid_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> PAID</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Period</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SleepyBabyy Premium Subscription</td>
            <td>${new Date(invoiceData.billing_period_start).toLocaleDateString()} - ${new Date(invoiceData.billing_period_end).toLocaleDateString()}</td>
            <td>$${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}</td>
          </tr>
        </tbody>
      </table>

      <div class="total">
        <p>Total Paid: $${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}</p>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>SleepyBabyy Team | support@sleepybaby.com</p>
        <p>&copy; ${new Date().getFullYear()} SleepyBabyy. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}
