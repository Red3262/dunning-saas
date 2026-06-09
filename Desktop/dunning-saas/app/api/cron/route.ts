import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

// 2. Baza de date: Supabase Admin Client pentru a ocoli RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // 1. Securitate: Verifică header-ul Authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('⚡️ Dunning Engine started...');

    // 3. Extragerea clienților: Ia toți utilizatorii care au cheile completate
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('client_settings')
      .select('*')
      .not('stripe_secret_key', 'is', null)
      .not('resend_api_key', 'is', null);

    if (clientsError || !clients || clients.length === 0) {
      return NextResponse.json({ message: 'No valid clients found to process.' });
    }

    let totalEmailsSent = 0;

    // 4. Logica (pe rând pentru fiecare client)
    for (const client of clients) {
      // 6. Izolarea Erorilor: Bloc try...catch pentru fiecare client
      try {
        // Inițializează clientul Stripe
        const stripe = new Stripe(client.stripe_secret_key, { apiVersion: '2026-05-27.dahlia' as any });
        // Inițializează clientul Resend
        const resend = new Resend(client.resend_api_key);

        // Extrage pașii lui din dunning_steps
        const { data: steps } = await supabaseAdmin
          .from('dunning_steps')
          .select('*')
          .eq('profile_id', client.profile_id)
          .order('step_order', { ascending: true });

        if (!steps || steps.length === 0) continue;

        // Cere de la Stripe toate abonamentele, expandând clientul
        const subscriptions = await stripe.subscriptions.list({
          status: 'all',
          expand: ['data.customer'],
        });

        for (const subscription of subscriptions.data) {
          // Fortăm motorul să creadă că toate abonamentele au fix 1 zi vechime pentru testare
          const daysPastDue = 1;

          // Găsește dacă există un pas în dunning_steps unde delay_value == days_past_due
          const matchingStep = steps.find(step => step.delay_value === daysPastDue);

          if (!matchingStep) continue;

          // Verifică dacă acest pas a fost deja trimis în dunning_logs
          const { data: existingLog } = await supabaseAdmin
            .from('dunning_logs')
            .select('id')
            .eq('profile_id', client.profile_id)
            .eq('subscription_id', subscription.id)
            .eq('step_order', matchingStep.step_order)
            .maybeSingle();

          if (existingLog) continue; // Pasul a fost deja trimis pentru acest abonament

          // Extrage emailul clientului abonat
          let customerEmail = 'unknown@email.com';
          if (subscription.customer && typeof subscription.customer !== 'string') {
            customerEmail = (subscription.customer as Stripe.Customer).email || customerEmail;
          }

          if (customerEmail === 'unknown@email.com') continue;

          // 5. Trimiterea Emailului
          const companyName = client.company_name || 'Echipa Noastră';
          const fromEmail = `${companyName} <onboarding@resend.dev>`;

          const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1c1c;">
              <h2 style="color: ${client.primary_color || '#1c1c1c'};">${matchingStep.subject}</h2>
              
              <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; color: #333;">${matchingStep.body}</div>

              ${matchingStep.image_url ? `<div style="text-align: center; margin: 30px 0;"><img src="${matchingStep.image_url}" alt="Thumbnail" style="max-width: 100%; border-radius: 8px; border: 1px solid #eaeaea;" /></div>` : ''}
              
              <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888; text-align: center;">
                ${client.footer_text || ''}
              </div>
            </div>
          `;

          const emailPayload: any = {
            from: fromEmail,
            to: customerEmail,
            subject: matchingStep.subject,
            html: emailHtml,
          };

          // Adaugă reply_to_email dacă există în setări
          if (client.reply_to_email) {
            emailPayload.replyTo = client.reply_to_email;
          } else if (client.reply_email) { // Fallback de siguranță pentru campul vechi
            emailPayload.replyTo = client.reply_email;
          }

          try {
            await resend.emails.send(emailPayload);
            totalEmailsSent++;

            // Salvează acțiunea în tabelul dunning_logs
            await supabaseAdmin.from('dunning_logs').insert({
              profile_id: client.profile_id,
              customer_email: customerEmail,
              subscription_id: subscription.id,
              step_order: matchingStep.step_order
            });

          } catch (emailErr) {
            console.error(`Failed to send email to ${customerEmail} via Resend:`, emailErr);
          }
        }
      } catch (clientErr) {
        // Izolarea Erorilor: Nu blocăm tot scriptul dacă un client are o eroare
        console.error(`Error processing client ${client.profile_id}:`, clientErr);
      }
    }

    return NextResponse.json({ message: `Successfully processed and sent ${totalEmailsSent} emails.` });

  } catch (error: any) {
    console.error('Cron Global Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
