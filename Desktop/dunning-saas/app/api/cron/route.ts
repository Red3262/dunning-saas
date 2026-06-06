import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

function calculateNextDate(currentDate: Date, delayValue: number, delayUnit: string) {
  const next = new Date(currentDate);
  switch (delayUnit) {
    case 'minutes': next.setMinutes(next.getMinutes() + delayValue); break;
    case 'hours': next.setHours(next.getHours() + delayValue); break;
    case 'days': next.setDate(next.getDate() + delayValue); break;
    case 'weeks': next.setDate(next.getDate() + (delayValue * 7)); break;
    case 'months': next.setMonth(next.getMonth() + delayValue); break;
    default: next.setDate(next.getDate() + delayValue); 
  }
  return next.toISOString();
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('⚡️ Dunning Engine started...');

    const { data: paymentsToProcess, error: fetchError } = await supabaseAdmin
      .from('failed_payments')
      .select('*')
      .eq('status', 'pending')
      .lte('next_email_at', new Date().toISOString());

    if (fetchError || !paymentsToProcess || paymentsToProcess.length === 0) {
      return NextResponse.json({ message: 'No emails to send right now.' });
    }

    let emailsSent = 0;

    for (const payment of paymentsToProcess) {
      const targetStepOrder = payment.current_step + 1;

      const { data: stepInfo } = await supabaseAdmin
        .from('dunning_steps')
        .select('*')
        .eq('profile_id', payment.profile_id)
        .eq('step_order', targetStepOrder)
        .maybeSingle();

      if (!stepInfo) {
        await supabaseAdmin
          .from('failed_payments')
          .update({ status: 'exhausted' })
          .eq('id', payment.id);
        continue;
      }

      const { data: brandSettings } = await supabaseAdmin
        .from('client_settings')
        .select('*')
        .eq('profile_id', payment.profile_id)
        .single();

      if (!brandSettings) continue;

      const imageHtml = stepInfo.image_url 
        ? `<div style="text-align: center; margin: 30px 0;"><img src="${stepInfo.image_url}" alt="Video Thumbnail" style="max-width: 100%; border-radius: 8px; border: 1px solid #eaeaea;" /></div>` 
        : '';

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1c1c;">
          <h2 style="color: ${brandSettings.primary_color || '#1c1c1c'};">${stepInfo.subject}</h2>
          
          <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; color: #333;">
            ${stepInfo.body}
          </div>

          ${imageHtml}
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="${payment.hosted_invoice_url || '#'}" style="background-color: ${brandSettings.primary_color || '#2563eb'}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Update Billing Details
            </a>
          </div>

          <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888; text-align: center;">
            ${brandSettings.footer_text || 'Sent automatically via Dunning engine.'}
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: `${brandSettings.sender_name} <${brandSettings.reply_email || 'billing@dunningsaas.com'}>`,
          to: payment.customer_email,
          replyTo: brandSettings.reply_email,
          subject: stepInfo.subject,
          html: emailHtml,
        });

        emailsSent++;

        const { data: nextStepInfo } = await supabaseAdmin
          .from('dunning_steps')
          .select('delay_value, delay_unit')
          .eq('profile_id', payment.profile_id)
          .eq('step_order', targetStepOrder + 1)
          .maybeSingle();

        let nextEmailAt = null;
        if (nextStepInfo) {
          nextEmailAt = calculateNextDate(new Date(), nextStepInfo.delay_value, nextStepInfo.delay_unit);
        }

        await supabaseAdmin
          .from('failed_payments')
          .update({ 
            current_step: targetStepOrder,
            next_email_at: nextEmailAt 
          })
          .eq('id', payment.id);

      } catch (err: any) {
        console.error(`Failed to send email to ${payment.customer_email}:`, err);
      }
    }

    return NextResponse.json({ message: `Successfully processed and sent ${emailsSent} emails.` });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}