import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Folosim Supabase Admin Client pentru a ocoli RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Preluăm parametrul userId din URL
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Preluăm semnătura din header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // 3. Preluăm raw body-ul pentru verificarea semnăturii
    const body = await req.text();

    // 2. Extragem stripe_webhook_secret din client_settings pentru acest utilizator
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('client_settings')
      .select('stripe_webhook_secret, total_recovered_revenue')
      .eq('profile_id', userId)
      .maybeSingle();

    if (settingsError || !settings || !settings.stripe_webhook_secret) {
      return NextResponse.json({ error: 'Webhook secret nu este configurat pentru acest utilizator.' }, { status: 400 });
    }

    // Inițializăm un client Stripe minimal pentru verificarea semnăturii
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', { 
      apiVersion: '2026-05-27.dahlia' as any 
    });

    let event: Stripe.Event;

    try {
      // Verificăm semnătura evenimentului Stripe
      event = stripe.webhooks.constructEvent(body, signature, settings.stripe_webhook_secret);
    } catch (err: any) {
      console.error(`Eroare la verificarea semnăturii webhook: ${err.message}`);
      return NextResponse.json({ error: `Eroare Webhook: ${err.message}` }, { status: 400 });
    }

    // 4. Ascultăm evenimentul invoice.payment_succeeded
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      
      // 5. Aflăm suma plătită (împărțită la 100 pentru a o transforma din cenți)
      const amountPaid = invoice.amount_paid / 100;

      if (amountPaid > 0) {
        // 6. Adunăm suma nouă la valoarea existentă
        const currentTotal = settings.total_recovered_revenue || 0;
        const newTotal = currentTotal + amountPaid;

        const { error: updateError } = await supabaseAdmin
          .from('client_settings')
          .update({ total_recovered_revenue: newTotal })
          .eq('profile_id', userId);

        if (updateError) {
          console.error('Eroare la salvarea noii sume recuperate în baza de date:', updateError);
          return NextResponse.json({ error: 'Eroare la actualizarea bazei de date' }, { status: 500 });
        }

        console.log(`✅ Succes! S-au recuperat $${amountPaid} pentru clientul ${userId}. Noul total este: $${newTotal}`);
      }
    }

    // Returnăm 200 pentru a informa Stripe că am primit și procesat evenimentul cu succes
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    // 7. Bloc try...catch solid
    console.error('Eroare neașteptată la procesarea webhook-ului Stripe:', error);
    return NextResponse.json({ error: 'Eroare internă de server' }, { status: 500 });
  }
}
