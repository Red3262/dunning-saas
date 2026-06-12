import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

// Inițializăm Stripe cu cheia platformei tale
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10" as any, // fallback for different stripe library versions
});

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Luăm ID-ul Stripe conectat al utilizatorului
    const { data: settings } = await supabase
      .from("client_settings")
      .select("stripe_account_id")
      .eq("profile_id", user.id)
      .single();

    if (!settings?.stripe_account_id) {
      return NextResponse.json({ error: "No connected Stripe account found." }, { status: 400 });
    }

    // 2. Cerem de la Stripe TOATE abonamentele eșuate (past_due și unpaid) PENTRU CONTUL CONECTAT
    // Aici e magia Stripe Connect: parametrul `stripeAccount`
    const failedSubscriptions = await stripe.subscriptions.list(
      {
        status: "past_due", // Poți schimba ulterior pe 'unpaid' sau lăsa gol pentru a prelua mai multe statusuri
        limit: 100, // Ajustează limita în funcție de volumul prevăzut
        expand: ["data.latest_invoice"], // Expandăm factura pentru a obține valoarea ei
      },
      { stripeAccount: settings.stripe_account_id }
    );

    // 3. Calculăm "At-Risk Revenue"
    let totalAtRisk = 0;
    
    // Calculăm suma facturilor neplătite curente
    for (const sub of failedSubscriptions.data) {
        // Trebuie să ne asigurăm că `latest_invoice` este un obiect, nu doar un ID (string)
        if (sub.latest_invoice && typeof sub.latest_invoice !== 'string') {
            const invoice = sub.latest_invoice as Stripe.Invoice;
            // Stripe returnează valorile în cenți (ex: 1500 = $15.00), așa că le convertim
            if (invoice.amount_due) {
                 totalAtRisk += invoice.amount_due / 100;
            }
        }
    }

    return NextResponse.json({
      success: true,
      atRiskRevenue: totalAtRisk,
      failedCount: failedSubscriptions.data.length,
    });

  } catch (error: any) {
    console.error("Eroare la sincronizarea Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
