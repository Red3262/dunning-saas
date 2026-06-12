import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // --- SECURITATE CRON ---
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

        // Dacă nu are cheie de Resend SAU cheie de AI, sărim peste (eșuare grațioasă)
        if (!settings?.resend_api_key || !settings?.ai_api_key) {
            console.log(`⚠️ Clientul ${tenantId} nu are setările complete (Resend sau AI Key).`);
            continue;
        }

        const resend = new Resend(settings.resend_api_key);
        const companyName = settings.company_name || 'Our Company';
        const brandColor = settings.primary_color || '#635BFF';
        const senderName = settings.sender_name || companyName;
        const fromEmail = settings.reply_email || 'billing@yourdomain.com';

        for (const payment of payments) {
           try {
               const systemPrompt = `You are an expert billing assistant acting on behalf of ${companyName}. 
               Goal: Write a polite, professional, yet urgent email to recover a failed payment.
               Format strictly as clean, modern HTML ready to be injected into an email body. Do not use markdown blocks.
               Use the brand color ${brandColor} for emphasis.`;

               const userPrompt = `Write a dunning email for a customer whose payment just failed.
               Context: Customer: ${payment.customer_email} | Product: ${payment.product_name || 'Subscription'} | Due: $${payment.amount_due} | Payment Link: ${payment.hosted_invoice_url}`;

               let aiGeneratedHtml = "";

               // --- RUTAREA AI-ULUI (BYOK) ---
               if (settings.ai_provider === 'openai') {
                   const openai = new OpenAI({ apiKey: settings.ai_api_key });
                   const aiResponse = await openai.chat.completions.create({
                       model: "gpt-4-turbo",
                       messages: [
                           { role: "system", content: systemPrompt },
                           { role: "user", content: userPrompt }
                       ],
                       temperature: 0.7,
                   });
                   aiGeneratedHtml = aiResponse.choices[0].message.content || "";

               } else if (settings.ai_provider === 'anthropic') {
                   const anthropic = new Anthropic({ apiKey: settings.ai_api_key });
                   const aiResponse = await anthropic.messages.create({
                       model: "claude-3-opus-20240229",
                       max_tokens: 1000,
                       system: systemPrompt,
                       messages: [{ role: "user", content: userPrompt }]
                   });
                   // Anthropic returneaza un array de blocuri de text
                   aiGeneratedHtml = (aiResponse.content[0] as any).text;

               } else if (settings.ai_provider === 'gemini') {
                   const genAI = new GoogleGenerativeAI(settings.ai_api_key);
                   // Gemini acceptă instrucțiunile de sistem la inițializarea modelului
                   const model = genAI.getGenerativeModel({ 
                       model: "gemini-1.5-flash",
                       systemInstruction: systemPrompt 
                   });
                   const aiResponse = await model.generateContent(userPrompt);
                   aiGeneratedHtml = aiResponse.response.text();
               }

               // Validare fallback: Dacă din vreun motiv AI-ul a dat crash sau a returnat gol
               if (!aiGeneratedHtml || aiGeneratedHtml.trim() === '') {
                   throw new Error("AI returned empty HTML");
               }

               // --- EXPEDIEREA ---
               await resend.emails.send({
                 from: `${senderName} <${fromEmail}>`,
                 to: payment.customer_email,
                 subject: `Action Required: Payment failed for ${companyName}`,
                 html: aiGeneratedHtml
               });

               await supabaseAdmin.from('dunning_logs').insert({
                   profile_id: tenantId,
                   customer_email: payment.customer_email,
                   subscription_id: payment.stripe_invoice_id,
                   step_order: 1, 
                   sent_at: new Date().toISOString()
               });

               await supabaseAdmin.from('failed_payments').update({
                   status: 'ai_recovery_initiated'
               }).eq('id', payment.id);
               
               emailsSentTotal++;
               console.log(`✅ AI Email (${settings.ai_provider}) trimis la ${payment.customer_email}`);

           } catch (emailError) {
               console.error(`❌ Eroare la trimiterea emailului AI pt ${payment.customer_email}:`, emailError);
           }
        }
    }

    return NextResponse.json({ success: true, emails_sent: emailsSentTotal });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}