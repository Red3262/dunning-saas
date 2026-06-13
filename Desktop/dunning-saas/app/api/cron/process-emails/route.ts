import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Securitate Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { data: pendingPayments, error: paymentsError } = await supabaseAdmin
      .from('failed_payments')
      .select('*')
      .eq('status', 'pending');

    if (paymentsError) throw paymentsError;
    if (!pendingPayments || pendingPayments.length === 0) return NextResponse.json({ message: 'No pending invoices.' });

    const paymentsByTenant = pendingPayments.reduce((acc, payment) => {
      if (!acc[payment.profile_id]) acc[payment.profile_id] = [];
      acc[payment.profile_id].push(payment);
      return acc;
    }, {} as Record<string, any[]>);

    let emailsSentTotal = 0;

    for (const [tenantId, payments] of Object.entries(paymentsByTenant) as [string, any[]][]) {
        const { data: settings } = await supabaseAdmin
          .from('client_settings')
          .select('*')
          .eq('profile_id', tenantId)
          .single();

        if (!settings?.resend_api_key) continue;

        const resend = new Resend(settings.resend_api_key);
        const companyName = settings.company_name || 'Our Company';
        const brandColor = settings.primary_color || '#635BFF';
        const senderName = settings.sender_name || companyName;
        const fromEmail = settings.reply_email || 'billing@yourdomain.com';

        for (const payment of payments) {
           try {
               // Șablon HTML static, profesional, curat.
               const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: ${brandColor};">${companyName}</h2>
                  <div style="background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; padding: 30px;">
                    <h1 style="font-size: 22px; font-weight: bold; margin-top: 0;">Action Required: Payment Failed</h1>
                    <p style="font-size: 16px; color: #555; line-height: 1.5;">
                      Hi there,<br><br>
                      We were unable to process your latest payment of <strong>$${payment.amount_due}</strong> for <strong>${payment.product_name || 'your subscription'}</strong>.
                    </p>
                    <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
                      Please update your payment method to keep your service active.
                    </p>
                    <a href="${payment.hosted_invoice_url}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                      Update Payment Method
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
                    ${settings.footer_text || 'If you have any questions, please reply to this email.'}
                  </p>
                </div>
               `;

               await resend.emails.send({
                 from: `${senderName} <${fromEmail}>`,
                 to: payment.customer_email,
                 subject: `Action Required: Payment failed for ${companyName}`,
                 html: emailHtml
               });

               await supabaseAdmin.from('dunning_logs').insert({
                   profile_id: tenantId,
                   customer_email: payment.customer_email,
                   subscription_id: payment.stripe_invoice_id,
                   step_order: 1, 
                   sent_at: new Date().toISOString()
               });

               await supabaseAdmin.from('failed_payments').update({
                   status: 'recovery_email_sent'
               }).eq('id', payment.id);
               
               emailsSentTotal++;
               console.log(`✅ Standard Email trimis la ${payment.customer_email}`);

           } catch (emailError) {
               console.error(`❌ Eroare la trimiterea emailului pt ${payment.customer_email}:`, emailError);
           }
        }
    }

    return NextResponse.json({ success: true, emails_sent: emailsSentTotal });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}