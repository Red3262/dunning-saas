import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !signature) {
      return NextResponse.json({ error: 'Missing userId or signature' }, { status: 400 });
    }

    const { data: settings } = await supabaseAdmin
      .from('client_settings')
      .select('stripe_webhook_secret')
      .eq('profile_id', userId)
      .single();

    if (!settings?.stripe_webhook_secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }

    // Aici am actualizat versiunea la cerința exactă a pachetului tău
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy', { apiVersion: '2026-05-27.dahlia' as any });
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, settings.stripe_webhook_secret);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

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

      console.log(`❌ Eșec înregistrat. Motorul de dunning va prelua factura: ${invoice.id}`);
    }

    else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;

      const { error } = await supabaseAdmin
        .from('failed_payments')
        .update({ status: 'recovered' })
        .eq('stripe_invoice_id', invoice.id)
        .eq('profile_id', userId);

      if (!error) {
        console.log(`✅ SUCCES! Factura ${invoice.id} a fost recuperată. Motorul de emailuri s-a oprit.`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}