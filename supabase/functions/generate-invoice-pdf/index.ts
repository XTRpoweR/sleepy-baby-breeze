
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { invoiceId, invoiceData } = await req.json();

    if (!invoiceId || !invoiceData) {
      throw new Error("Missing required invoice data");
    }

    logStep("Processing invoice", { invoiceId, invoiceNumber: invoiceData.invoice_number });

    // Fetch real Stripe invoice data
    let stripeInvoice = null;
    let stripeCustomer = null;
    
    if (invoiceData.stripe_invoice_id) {
      try {
        stripeInvoice = await stripe.invoices.retrieve(invoiceData.stripe_invoice_id, {
          expand: ['customer', 'subscription', 'payment_intent']
        });
        
        if (typeof stripeInvoice.customer === 'string') {
          stripeCustomer = await stripe.customers.retrieve(stripeInvoice.customer);
        } else {
          stripeCustomer = stripeInvoice.customer;
        }
        
        logStep("Fetched Stripe invoice data", { 
          invoiceId: stripeInvoice.id, 
          customerEmail: stripeCustomer?.email 
        });
      } catch (error) {
        logStep("Warning: Could not fetch Stripe invoice", { error: error.message });
      }
    }

    // Generate comprehensive HTML invoice content
    const htmlContent = generateProfessionalInvoiceHTML(invoiceData, stripeInvoice, stripeCustomer);

    // Store as HTML file in Supabase Storage with proper content type
    const fileName = `invoices/${invoiceData.invoice_number}.html`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('baby-memories')
      .upload(fileName, new Blob([htmlContent], { type: 'text/html' }), {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true,
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

    logStep("HTML invoice generated successfully", { pdfUrl });

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

function generateProfessionalInvoiceHTML(invoiceData: any, stripeInvoice: any, stripeCustomer: any): string {
  const customerName = stripeCustomer?.name || stripeCustomer?.email || 'Valued Customer';
  const customerEmail = stripeCustomer?.email || 'Email not available';
  const customerAddress = stripeCustomer?.address || null;
  
  // Get line items from Stripe if available
  const lineItems = stripeInvoice?.lines?.data || [{
    description: 'SleepyBabyy Premium Subscription',
    amount: invoiceData.amount_paid,
    currency: invoiceData.currency,
    quantity: 1
  }];

  const subtotal = invoiceData.amount_paid;
  const tax = stripeInvoice?.tax || 0;
  const total = invoiceData.amount_paid;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${invoiceData.invoice_number}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
      line-height: 1.6;
      background: #f8fafc;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .logo-emoji {
      font-size: 36px;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 600;
      margin: 20px 0 8px;
    }
    .invoice-number {
      font-size: 16px;
      opacity: 0.9;
    }
    .invoice-content {
      padding: 40px;
    }
    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .detail-section h3 {
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .detail-item {
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: 500;
      color: #6b7280;
    }
    .detail-value {
      color: #1f2937;
    }
    .line-items {
      margin: 40px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .items-table th {
      background: #f8fafc;
      color: #374151;
      font-weight: 600;
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table td {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .amount {
      text-align: right;
      font-weight: 500;
    }
    .totals {
      margin-top: 40px;
      border-top: 2px solid #e5e7eb;
      padding-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .total-row.final {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
    }
    .payment-status {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .company-info {
      background: #f8fafc;
      padding: 24px;
      border-radius: 8px;
      margin: 20px 0;
    }
    @media print {
      body { padding: 20px; background: white; }
      .invoice-container { box-shadow: none; }
    }
    @media (max-width: 768px) {
      body { padding: 20px; }
      .invoice-details { grid-template-columns: 1fr; gap: 20px; }
      .invoice-content { padding: 20px; }
      .invoice-header { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="logo">
        <span class="logo-emoji">🍼</span>
        <span>SleepyBabyy</span>
      </div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">#${invoiceData.invoice_number}</div>
    </div>

    <div class="invoice-content">
      <div class="invoice-details">
        <div class="detail-section">
          <h3>Bill To</h3>
          <div class="detail-item">
            <div class="detail-label">Customer:</div>
            <div class="detail-value">${customerName}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${customerEmail}</div>
          </div>
          ${customerAddress ? `
          <div class="detail-item">
            <div class="detail-label">Address:</div>
            <div class="detail-value">
              ${customerAddress.line1 || ''}<br>
              ${customerAddress.line2 ? customerAddress.line2 + '<br>' : ''}
              ${customerAddress.city || ''} ${customerAddress.state || ''} ${customerAddress.postal_code || ''}<br>
              ${customerAddress.country || ''}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="detail-section">
          <h3>Invoice Details</h3>
          <div class="detail-item">
            <div class="detail-label">Invoice Date:</div>
            <div class="detail-value">${new Date(invoiceData.paid_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Payment Date:</div>
            <div class="detail-value">${new Date(invoiceData.paid_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="payment-status">PAID</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Billing Period:</div>
            <div class="detail-value">
              ${new Date(invoiceData.billing_period_start).toLocaleDateString()} - 
              ${new Date(invoiceData.billing_period_end).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div class="line-items">
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 80px; text-align: center;">Qty</th>
              <th style="width: 120px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item: any) => `
              <tr>
                <td>
                  <strong>${item.description || 'SleepyBabyy Premium Subscription'}</strong>
                  <br>
                  <small style="color: #6b7280;">Monthly subscription service</small>
                </td>
                <td style="text-align: center;">${item.quantity || 1}</td>
                <td class="amount">$${((item.amount || invoiceData.amount_paid) / 100).toFixed(2)}</td>
                <td class="amount">$${((item.amount || invoiceData.amount_paid) / 100).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${(subtotal / 100).toFixed(2)}</span>
        </div>
        ${tax > 0 ? `
        <div class="total-row">
          <span>Tax:</span>
          <span>$${(tax / 100).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row final">
          <span>Total Paid:</span>
          <span>$${(total / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}</span>
        </div>
      </div>

      <div class="company-info">
        <h3 style="margin: 0 0 12px 0; color: #1f2937;">Company Information</h3>
        <p style="margin: 0; color: #6b7280;">
          <strong>SleepyBabyy</strong><br>
          Premium Baby Care Solutions<br>
          Email: support@sleepybaby.com<br>
          Website: www.sleepybaby.com
        </p>
      </div>

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This invoice was generated automatically. For questions about this invoice, please contact our support team at support@sleepybaby.com</p>
        <p>&copy; ${new Date().getFullYear()} SleepyBabyy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
