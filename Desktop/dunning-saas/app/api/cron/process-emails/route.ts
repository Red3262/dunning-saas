import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Folosim Service Role pentru a accesa datele tuturor clienților în fundal
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // 1. Preluăm TOATE facturile eșuate care sunt în așteptare ('pending')
    const { data: pendingPayments, error: paymentsError } = await supabaseAdmin
      .from('failed_payments')
      .select('*')
      .eq('status', 'pending');

    if (paymentsError) throw paymentsError;

    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({ message: 'Nicio factură restantă de procesat.' });
    }

    // 2. Grupăm facturile pe Clienți (Tenanți) pentru eficiență maximă
    const paymentsByTenant = pendingPayments.reduce((acc, payment) => {
      if (!acc[payment.profile_id]) acc[payment.profile_id] = [];
      acc[payment.profile_id].push(payment);
      return acc;
    }, {} as Record<string, any[]>);

    let emailsSentTotal = 0;

    // 3. Procesăm fiecare Client (Tenant) pe rând
    for (const [tenantId, payments] of Object.entries(paymentsByTenant) as [string, any[]][]) {
        
        // A. Tragem setările specifice ACESTUI client (Brand, Resend API, Email de Reply)
        const { data: settings } = await supabaseAdmin
          .from('client_settings')
          .select('*')
          .eq('profile_id', tenantId)
          .single();

        if (!settings?.resend_api_key) {
          console.log(`⚠️ Clientul ${tenantId} nu are cheia Resend configurată. Sărim peste facturile lui.`);
          continue;
        }

        // Inițializăm Resend cu cheia LUI (fiecare client trimite de pe serverul/domeniul lui)
        const resend = new Resend(settings.resend_api_key);

        // Date de fallback în caz că utilizatorul nu și-a completat setările
        const companyName = settings.company_name || 'Our Company';
        const brandColor = settings.primary_color || '#635BFF';
        const senderName = settings.sender_name || companyName;
        // Notă: La Resend, domeniul expeditorului trebuie să fie verificat.
        const fromEmail = settings.reply_email || 'billing@yourdomain.com'; 

        // B. Procesăm facturile acestui client
        for (const payment of payments) {
           try {
               // Construim șablonul HTML profesional de Dunning
               const emailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1c1c;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: ${brandColor}; margin: 0;">${companyName}</h2>
                  </div>
                  
                  <div style="background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h1 style="font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Action Required: Payment Failed</h1>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
                      Hi there,<br><br>
                      We were unable to process your latest payment of <strong>$${payment.amount_due}</strong> for your <strong>${payment.product_name || 'subscription'}</strong>.
                    </p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 32px;">
                      To keep your access active, please update your payment method using our secure link below:
                    </p>
                    
                    <a href="${payment.hosted_invoice_url}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
                      Update Payment Method
                    </a>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="font-size: 12px; color: #888;">
                      ${settings.footer_text || `If you have any questions, please reply to this email.`}<br>
                      &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                    </p>
                  </div>
                </div>
               `;

               // Trimitem efectiv emailul folosind API-ul Resend
               await resend.emails.send({
                 from: `${senderName} <${fromEmail}>`,
                 to: payment.customer_email,
                 subject: `Action Required: Payment failed for ${companyName}`,
                 html: emailHtml
               });

               // C. Înregistrăm acțiunea în log-uri ca să o vedem pe Dashboard
               await supabaseAdmin.from('dunning_logs').insert({
                   profile_id: tenantId,
                   customer_email: payment.customer_email,
                   subscription_id: payment.stripe_invoice_id, // Folosim Invoice ID pentru tracking
                   step_order: 1, 
                   sent_at: new Date().toISOString()
               });

               // D. Trecem factura din 'pending' în statusul de dunning (ex: 'step_1_sent')
               // Ca să nu îi mai trimitem același email și ora următoare
               await supabaseAdmin.from('failed_payments').update({
                   status: 'step_1_sent'
               }).eq('id', payment.id);
               
               emailsSentTotal++;
               console.log(`✅ Email expediat către ${payment.customer_email} (Client: ${tenantId})`);

           } catch (emailError) {
               console.error(`❌ Eroare la trimiterea emailului pt ${payment.customer_email}:`, emailError);
           }
        }
    }

    return NextResponse.json({ success: true, emails_sent: emailsSentTotal });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}