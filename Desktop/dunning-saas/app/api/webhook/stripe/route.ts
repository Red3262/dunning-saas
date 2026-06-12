import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Folosim cheia de Service Role pentru a avea drepturi de admin asupra bazei de date
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inițializăm Stripe cu API version-ul tău specific
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy', { 
  apiVersion: '2026-05-27.dahlia' as any 
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // Preluăm semnătura Stripe din headere
    const signature = (await headers()).get("Stripe-Signature") as string;

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    
    try {
      // NOU: Folosim secretul TĂU universal (Connect Webhook Secret) în loc să-l căutăm pe al clientului
      event = stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET! 
      );
    } catch (err: any) {
      console.error(`⚠️ Eroare de Securitate Webhook:`, err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // --- MAGIA MULTI-TENANCY ---
    // Stripe ne spune din ce cont conectat a venit evenimentul
    const connectedAccountId = event.account;

    if (!connectedAccountId) {
      console.log("Ignorăm evenimentul. Nu aparține unui cont Stripe conectat.");
      return NextResponse.json({ received: true });
    }

    // Căutăm în baza noastră de date CĂRUI utilizator (profile_id) îi aparține acest cont Stripe
    const { data: settings } = await supabaseAdmin
      .from('client_settings')
      .select('profile_id')
      .eq('stripe_account_id', connectedAccountId)
      .single();

    if (!settings?.profile_id) {
      console.error(`Eroare: Nu avem client asociat pentru ID-ul Stripe ${connectedAccountId}`);
      return NextResponse.json({ error: 'Client not mapped' }, { status: 404 });
    }

    const userId = settings.profile_id;

    // --- LOGICA TA DE BUSINESS (Păstrată intactă) ---

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      
      const customerEmail = invoice.customer_email || 'unknown@email.com';
      const amountDue = invoice.amount_due / 100; 
      const currency = invoice.currency;
      const hostedInvoiceUrl = invoice.hosted_invoice_url;
      
      let productId = null;
      let productName = null;
      if (invoice.lines?.data?.length > 0) {
        const firstLineItem = invoice.lines.data[0];
        
        // Fentăm TypeScript-ul strict forțând tipul cu "any" ca să extragem price
        productId = typeof (firstLineItem as any).price?.product === 'string' 
          ? (firstLineItem as any).price.product 
          : null;
        productName = firstLineItem.description || 'Subscription';
      }

      await supabaseAdmin
        .from('failed_payments')
        .insert({
          profile_id: userId,
          stripe_invoice_id: invoice.id,
          customer_email: customerEmail,
          amount_due: amountDue,
          currency: currency,
          status: 'pending',
          stripe_product_id: productId,
          product_name: productName,
          hosted_invoice_url: hostedInvoiceUrl
        });

      console.log(`❌ Eșec înregistrat. Motorul de dunning va prelua factura: ${invoice.id} (Client: ${userId})`);
    }

    else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;

      const { error } = await supabaseAdmin
        .from('failed_payments')
        .update({ status: 'recovered' })
        .eq('stripe_invoice_id', invoice.id)
        .eq('profile_id', userId);

      if (!error) {
        console.log(`✅ SUCCES! Factura ${invoice.id} a fost recuperată. (Client: ${userId})`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Internal Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}