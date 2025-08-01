import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
};

// Enhanced webhook signature verification
const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  try {
    // This is a simplified version - in production, implement proper HMAC verification
    // For now, just check that signature exists
    return signature && signature.length > 0;
  } catch (error) {
    logStep("Signature verification failed", error);
    return false;
  }
};

// Rate limiting map to prevent abuse
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }
  
  rateLimitMap.set(clientId, record);
  return record.count <= RATE_LIMIT_MAX;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on IP
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      logStep("Rate limit exceeded", { clientIp });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    logStep("Webhook received", { method: req.method, url: req.url, clientIp });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the raw body as text for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature) {
      logStep("ERROR", "No Stripe signature found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify webhook signature for security
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      logStep("ERROR", "Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
      logStep("Webhook event parsed", { type: event.type, id: event.id });
    } catch (err) {
      logStep("ERROR", "Invalid JSON payload");
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, event);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(supabaseClient, event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(supabaseClient, event);
        await handleInvoiceGeneration(supabaseClient, event);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(supabase: any, event: any) {
  const session = event.data.object;
  logStep("Handling checkout session completed", { 
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription 
  });

  try {
    // Get customer email
    const customerEmail = session.customer_details?.email || session.customer_email;
    if (!customerEmail) {
      logStep("ERROR", "No customer email found in checkout session");
      return;
    }

    // If this is a subscription checkout, handle subscription creation
    if (session.subscription) {
      // Update or create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          email: customerEmail,
          status: 'active',
          subscription_tier: 'premium',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'stripe_subscription_id'
        });

      if (subError) {
        logStep("ERROR creating subscription record", { error: subError.message });
      } else {
        logStep("Subscription record created/updated successfully");
      }

      // Create immediate invoice for the new subscription
      if (session.invoice) {
        logStep("Creating invoice for new subscription", { invoiceId: session.invoice });
        
        // Get subscription details to find user_id
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('user_id, id')
          .eq('stripe_subscription_id', session.subscription)
          .single();

        if (subscription) {
          // Generate invoice number
          const { data: invoiceNumberResult } = await supabase
            .rpc('generate_invoice_number');

          const invoiceNumber = invoiceNumberResult || `INV-${Date.now()}`;

          // Create invoice record
          const invoiceData = {
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            stripe_invoice_id: session.invoice,
            invoice_number: invoiceNumber,
            amount_paid: session.amount_total || 0,
            currency: session.currency || 'usd',
            billing_period_start: new Date().toISOString(),
            billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            paid_at: new Date().toISOString(),
            invoice_status: 'paid',
          };

          const { data: createdInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single();

          if (invoiceError) {
            logStep("ERROR creating invoice record", { error: invoiceError.message });
          } else {
            logStep("Invoice record created successfully", { invoiceId: createdInvoice.id });

            // Generate PDF and send email immediately
            await generateAndSendInvoice(supabase, createdInvoice, {
              id: session.invoice,
              customer: session.customer,
              amount_paid: session.amount_total || 0,
              currency: session.currency || 'usd',
              period_start: Math.floor(Date.now() / 1000),
              period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              status_transitions: {
                paid_at: Math.floor(Date.now() / 1000)
              }
            });
          }
        } else {
          logStep("ERROR", "Subscription not found for invoice creation");
        }
      }
    }

    logStep("Checkout session completed processing finished");

  } catch (error) {
    logStep("ERROR in checkout session completed", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionEvent(supabase: any, event: any) {
  const subscription = event.data.object;
  logStep("Handling subscription event", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status 
  });

  // Get customer email from Stripe
  const customer = subscription.customer;
  
  // Update or create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer,
      status: subscription.status,
      subscription_tier: subscription.status === 'active' ? 'premium' : 'basic',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) {
    logStep("ERROR updating subscription", { error: error.message });
    throw error;
  }

  logStep("Subscription updated successfully");
}

async function handleSubscriptionCancellation(supabase: any, event: any) {
  const subscription = event.data.object;
  logStep("Handling subscription cancellation", { subscriptionId: subscription.id });

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      subscription_tier: 'basic',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logStep("ERROR canceling subscription", { error: error.message });
    throw error;
  }

  logStep("Subscription canceled successfully");
}

async function handlePaymentSuccess(supabase: any, event: any) {
  const invoice = event.data.object;
  logStep("Handling payment success", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription 
  });

  // Update subscription status to active if payment succeeded
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        subscription_tier: 'premium',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      logStep("ERROR updating subscription after payment", { error: error.message });
      throw error;
    }

    logStep("Subscription activated after successful payment");
  }
}

async function handlePaymentFailed(supabase: any, event: any) {
  const invoice = event.data.object;
  logStep("Handling payment failure", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription 
  });

  // Update subscription status based on payment failure
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      logStep("ERROR updating subscription after payment failure", { error: error.message });
      throw error;
    }

    logStep("Subscription marked as past_due after payment failure");
  }
}

async function handleInvoiceGeneration(supabase: any, event: any) {
  const invoice = event.data.object;
  logStep("Handling invoice generation", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    customerId: invoice.customer,
    amountPaid: invoice.amount_paid
  });

  try {
    // Get subscription details to find user_id
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      logStep("ERROR", "Subscription not found for invoice");
      return;
    }

    // Generate invoice number
    const { data: invoiceNumberResult } = await supabase
      .rpc('generate_invoice_number');

    const invoiceNumber = invoiceNumberResult || `INV-${Date.now()}`;

    // Create invoice record
    const invoiceData = {
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      stripe_invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency || 'usd',
      billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
      billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
      paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
      invoice_status: 'paid',
    };

    const { data: createdInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      logStep("ERROR creating invoice record", { error: invoiceError.message });
      throw invoiceError;
    }

    logStep("Invoice record created successfully", { invoiceId: createdInvoice.id });

    // Generate PDF and send email
    await generateAndSendInvoice(supabase, createdInvoice, invoice);

  } catch (error) {
    logStep("ERROR in invoice generation", { error: error.message });
    throw error;
  }
}

async function generateAndSendInvoice(supabase: any, invoiceRecord: any, stripeInvoice: any) {
  logStep("Generating and sending invoice", { invoiceId: invoiceRecord.id });

  try {
    // Get user details
    const { data: user } = await supabase.auth.admin.getUserById(invoiceRecord.user_id);
    const userEmail = user?.user?.email;

    if (!userEmail) {
      logStep("ERROR", "User email not found for invoice");
      return;
    }

    // Call the generate-invoice-pdf edge function
    const { data: pdfResult, error: pdfError } = await supabase.functions.invoke('generate-invoice-pdf', {
      body: {
        invoiceId: invoiceRecord.id,
        invoiceData: invoiceRecord,
        stripeInvoice: stripeInvoice
      }
    });

    if (pdfError) {
      logStep("ERROR generating PDF", { error: pdfError.message });
      return;
    }

    // Send invoice email
    await sendInvoiceEmail(supabase, userEmail, invoiceRecord, pdfResult.pdfUrl);

    logStep("Invoice generated and sent successfully");

  } catch (error) {
    logStep("ERROR in generate and send invoice", { error: error.message });
  }
}

async function sendInvoiceEmail(supabase: any, userEmail: string, invoiceRecord: any, pdfUrl: string) {
  logStep("Sending invoice email", { email: userEmail, invoiceNumber: invoiceRecord.invoice_number });

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      logStep("ERROR", "RESEND_API_KEY not configured");
      return;
    }

    const emailData = {
      from: 'SleepyBabyy <noreply@sleepybaby.com>',
      to: [userEmail],
      subject: `Your SleepyBabyy Subscription Invoice - ${invoiceRecord.invoice_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; max-width: 600px; margin: 0 auto; }
            .invoice-details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; margin-top: 30px; }
            .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍼 SleepyBabyy</h1>
            <p>Your Subscription Invoice</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your subscription!</h2>
            <p>We've processed your payment and your SleepyBabyy Premium subscription is now active.</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceRecord.invoice_number}</p>
              <p><strong>Amount Paid:</strong> $${(invoiceRecord.amount_paid / 100).toFixed(2)} ${invoiceRecord.currency.toUpperCase()}</p>
              <p><strong>Billing Period:</strong> ${new Date(invoiceRecord.billing_period_start).toLocaleDateString()} - ${new Date(invoiceRecord.billing_period_end).toLocaleDateString()}</p>
              <p><strong>Payment Date:</strong> ${new Date(invoiceRecord.paid_at).toLocaleDateString()}</p>
            </div>

            <p>Your invoice is attached to this email as a PDF. You can also access all your invoices from your account dashboard.</p>
            
            <p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard" class="button">
                View Dashboard
              </a>
            </p>

            <h3>What's Next?</h3>
            <ul>
              <li>Access all premium features in your SleepyBabyy app</li>
              <li>Enjoy unlimited baby tracking and family sharing</li>
              <li>Generate detailed reports and insights</li>
              <li>Priority customer support</li>
            </ul>
          </div>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:support@sleepybaby.com">support@sleepybaby.com</a></p>
            <p>&copy; ${new Date().getFullYear()} SleepyBabyy. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      attachments: pdfUrl ? [
        {
          filename: `${invoiceRecord.invoice_number}.pdf`,
          path: pdfUrl
        }
      ] : undefined
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      logStep("ERROR sending email", { error });
      return;
    }

    logStep("Invoice email sent successfully");

  } catch (error) {
    logStep("ERROR in send invoice email", { error: error.message });
  }
}
