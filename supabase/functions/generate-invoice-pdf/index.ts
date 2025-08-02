
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

    // Generate PDF using jsPDF since Puppeteer is not reliable in Deno
    const pdfBuffer = await generateSimplePDF(invoiceData, stripeInvoice, stripeCustomer);

    // Store as PDF file in Supabase Storage
    const fileName = `invoices/${invoiceData.invoice_number}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('baby-memories')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
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

    logStep("PDF invoice generated successfully", { pdfUrl });

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

async function generateSimplePDF(invoiceData: any, stripeInvoice: any, stripeCustomer: any): Promise<Uint8Array> {
  // Since Puppeteer is not reliable, we'll use a different approach
  // Import jsPDF for client-side PDF generation
  const { jsPDF } = await import("https://esm.sh/jspdf@2.5.1");
  
  try {
    logStep("Generating PDF with jsPDF");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('🍼 SleepyBabyy', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', pageWidth / 2, 45, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`#${invoiceData.invoice_number}`, pageWidth / 2, 55, { align: 'center' });
    
    // Customer info
    doc.setFontSize(14);
    doc.text('Bill To:', 20, 80);
    doc.setFontSize(10);
    const customerName = stripeCustomer?.name || stripeCustomer?.email || 'Valued Customer';
    const customerEmail = stripeCustomer?.email || 'Email not available';
    
    doc.text(`Customer: ${customerName}`, 20, 95);
    doc.text(`Email: ${customerEmail}`, 20, 105);
    
    // Invoice details
    doc.setFontSize(14);
    doc.text('Invoice Details:', 120, 80);
    doc.setFontSize(10);
    
    const invoiceDate = new Date(invoiceData.paid_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    doc.text(`Invoice Date: ${invoiceDate}`, 120, 95);
    doc.text(`Payment Date: ${invoiceDate}`, 120, 105);
    doc.text('Status: PAID', 120, 115);
    
    const billingStart = new Date(invoiceData.billing_period_start).toLocaleDateString();
    const billingEnd = new Date(invoiceData.billing_period_end).toLocaleDateString();
    doc.text(`Billing Period: ${billingStart} - ${billingEnd}`, 120, 125);
    
    // Line items table
    doc.setFontSize(12);
    doc.text('Description', 20, 150);
    doc.text('Qty', 100, 150);
    doc.text('Amount', 150, 150);
    
    // Draw line
    doc.line(20, 155, 190, 155);
    
    doc.setFontSize(10);
    doc.text('SleepyBabyy Premium Subscription', 20, 170);
    doc.text('Monthly subscription service', 20, 180);
    doc.text('1', 100, 170);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, 150, 170);
    
    // Totals
    doc.line(120, 200, 190, 200);
    doc.setFontSize(12);
    doc.text(`Total Paid: $${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}`, 150, 215, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your business!', pageWidth / 2, 250, { align: 'center' });
    doc.text('For support, contact: support@sleepybaby.com', pageWidth / 2, 260, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} SleepyBabyy. All rights reserved.`, pageWidth / 2, 270, { align: 'center' });
    
    const pdfOutput = doc.output('arraybuffer');
    logStep("PDF generated successfully with jsPDF");
    
    return new Uint8Array(pdfOutput);
    
  } catch (error) {
    logStep("ERROR generating PDF with jsPDF", { error: error.message });
    // Fallback to simple text-based content if jsPDF fails
    return generateFallbackPDF(invoiceData);
  }
}

function generateFallbackPDF(invoiceData: any): Uint8Array {
  logStep("Using fallback PDF generation");
  
  // Create a simple PDF structure manually
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj

4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

5 0 obj
<< /Length 500 >>
stream
BT
/F1 24 Tf
306 720 Td
(SleepyBabyy Invoice) Tj
0 -30 Td
/F1 18 Tf
(#${invoiceData.invoice_number}) Tj
0 -50 Td
/F1 12 Tf
(Amount: $${(invoiceData.amount_paid / 100).toFixed(2)} ${invoiceData.currency.toUpperCase()}) Tj
0 -20 Td
(Date: ${new Date(invoiceData.paid_at).toLocaleDateString()}) Tj
0 -20 Td
(Status: PAID) Tj
0 -40 Td
(Thank you for your subscription to SleepyBabyy Premium!) Tj
0 -30 Td
(For support, contact: support@sleepybaby.com) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000252 00000 n 
0000000321 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
872
%%EOF`;

  return new TextEncoder().encode(content);
}
