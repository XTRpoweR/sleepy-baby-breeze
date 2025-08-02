
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

    // Generate professional PDF
    const pdfBuffer = await generateProfessionalPDF(invoiceData, stripeInvoice, stripeCustomer);

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

async function generateProfessionalPDF(invoiceData: any, stripeInvoice: any, stripeCustomer: any): Promise<Uint8Array> {
  const { jsPDF } = await import("https://esm.sh/jspdf@2.5.1");
  
  try {
    logStep("Generating professional PDF with jsPDF");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const primaryBlue = [59, 130, 246]; // #3b82f6
    const darkGray = [55, 65, 81]; // #374151
    const lightGray = [156, 163, 175]; // #9ca3af
    const green = [34, 197, 94]; // #22c55e
    
    // Header Section
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Company Logo Area (left side)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('🍼', 20, 25);
    
    doc.setFontSize(20);
    doc.text('SleepyBabyy', 35, 30);
    
    // Invoice Title (right side)
    doc.setFontSize(28);
    doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });
    
    // Reset text color for body
    doc.setTextColor(...darkGray);
    
    // Company Information Section
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let yPos = 70;
    
    doc.text('Sleepy business sandbox', 20, yPos);
    doc.text('12555 Berlin, Germany', 20, yPos + 8);
    doc.text('support@sleepybabyy.com', 20, yPos + 16);
    
    // Invoice Details (right side)
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Number:', pageWidth - 100, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(invoiceData.invoice_number, pageWidth - 20, yPos, { align: 'right' });
    
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Date:', pageWidth - 100, yPos + 8);
    doc.setFont(undefined, 'normal');
    const invoiceDate = new Date(invoiceData.paid_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(invoiceDate, pageWidth - 20, yPos + 8, { align: 'right' });
    
    doc.setFont(undefined, 'bold');
    doc.text('Due Date:', pageWidth - 100, yPos + 16);
    doc.setFont(undefined, 'normal');
    doc.text(invoiceDate, pageWidth - 20, yPos + 16, { align: 'right' });
    
    // Bill To Section
    yPos = 120;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO', 20, yPos);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const customerName = stripeCustomer?.name || stripeCustomer?.email || 'Valued Customer';
    const customerEmail = stripeCustomer?.email || 'Email not available';
    const customerAddress = stripeCustomer?.address ? 
      `${stripeCustomer.address.line1 || ''}, ${stripeCustomer.address.city || ''}, ${stripeCustomer.address.country || ''}`.replace(/^,\s*|,\s*$/g, '') : 
      'Address not available';
    
    doc.text(customerName, 20, yPos + 15);
    if (customerAddress !== 'Address not available') {
      doc.text(customerAddress, 20, yPos + 23);
    }
    doc.text(customerEmail, 20, yPos + 31);
    
    // Amount Due Section (right side)
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(pageWidth - 140, yPos + 5, 120, 35, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('AMOUNT DUE (USD)', pageWidth - 130, yPos + 15);
    
    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, pageWidth - 130, yPos + 28);
    
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text('PAID', pageWidth - 130, yPos + 35);
    
    // Reset text color
    doc.setTextColor(...darkGray);
    
    // Table Header
    yPos = 180;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, pageWidth - 40, 15, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIPTION', 25, yPos + 10);
    doc.text('QTY', pageWidth - 120, yPos + 10);
    doc.text('UNIT PRICE', pageWidth - 80, yPos + 10);
    doc.text('AMOUNT', pageWidth - 40, yPos + 10, { align: 'right' });
    
    // Table Border
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    doc.line(20, yPos + 15, pageWidth - 20, yPos + 15);
    
    // Table Content
    yPos += 15;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    const billingStart = new Date(invoiceData.billing_period_start).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
    const billingEnd = new Date(invoiceData.billing_period_end).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
    
    // Service row
    doc.text('SleepyBabyy Premium Subscription', 25, yPos + 10);
    doc.text(`Service period: ${billingStart} - ${billingEnd}`, 25, yPos + 18);
    doc.text('1', pageWidth - 120, yPos + 10);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, pageWidth - 80, yPos + 10);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, pageWidth - 40, yPos + 10, { align: 'right' });
    
    // Table bottom border
    doc.line(20, yPos + 25, pageWidth - 20, yPos + 25);
    
    // Totals Section
    yPos += 40;
    const totalsX = pageWidth - 120;
    
    doc.setFont(undefined, 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, pageWidth - 40, yPos, { align: 'right' });
    
    doc.text('Tax:', totalsX, yPos + 8);
    doc.text('$0.00', pageWidth - 40, yPos + 8, { align: 'right' });
    
    // Total line
    doc.setDrawColor(...darkGray);
    doc.line(totalsX, yPos + 15, pageWidth - 20, yPos + 15);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Total:', totalsX, yPos + 23);
    doc.text(`$${(invoiceData.amount_paid / 100).toFixed(2)}`, pageWidth - 40, yPos + 23, { align: 'right' });
    
    // Footer Section
    const footerY = pageHeight - 30;
    
    // Thank you message
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkGray);
    doc.text('Thank you for your business!', 20, footerY);
    
    // Support contact
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text('For support, contact: support@sleepybabyy.com', 20, footerY + 8);
    
    // Page number
    doc.text('Page 1 of 1', pageWidth - 20, footerY + 8, { align: 'right' });
    
    const pdfOutput = doc.output('arraybuffer');
    logStep("Professional PDF generated successfully with jsPDF");
    
    return new Uint8Array(pdfOutput);
    
  } catch (error) {
    logStep("ERROR generating professional PDF with jsPDF", { error: error.message });
    // Fallback to simple PDF generation
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
(For support, contact: support@sleepybabyy.com) Tj
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
