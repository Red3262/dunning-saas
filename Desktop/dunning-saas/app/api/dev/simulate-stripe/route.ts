import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // Get the first tenant from the database (for testing convenience)
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id').limit(1);
    
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: 'No profiles found in database to attach the test payment to.' }, { status: 400 });
    }

    const tenantId = profiles[0].id;

    // Create a mock Stripe "invoice.payment_failed" payload
    const mockStripePayload = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_1MockInvoice123456789',
          customer: 'cus_MockCustomer999',
          customer_email: 'test_defaulter@example.com',
          amount_due: 4900, // $49.00
          currency: 'usd',
          hosted_invoice_url: 'https://pay.stripe.com/invoice/mock_payment_link_777',
        }
      }
    };

    // Trigger our own webhook locally
    const webhookUrl = `http://localhost:3000/api/webhook/stripe?tenant=${tenantId}`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockStripePayload),
    });

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully simulated a Stripe failed payment event.',
        webhookUrlTriggered: webhookUrl,
        nextStep: 'Now go to http://localhost:3000/api/cron to process this payment!'
      });
    } else {
      const text = await response.text();
      return NextResponse.json({ error: 'Webhook rejected the payload', details: text }, { status: response.status });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
