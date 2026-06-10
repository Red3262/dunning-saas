import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Dacă Stripe nu trimite niciun cod, oprim procesul
  if (!code) {
    return NextResponse.json({ error: "Nu a fost furnizat codul de autorizare Stripe." }, { status: 400 });
  }

  try {
    // 1. Schimbăm codul de autorizare pe ID-ul real al contului Stripe conectat
    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        // Folosim cheia ta secretă principală (platforma ta) ca să validăm cererea
        client_secret: process.env.STRIPE_SECRET_KEY!, 
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Eroare de la Stripe OAuth:", data);
      return NextResponse.redirect(new URL("/dashboard?error=stripe_oauth_failed", request.url));
    }

    // Acesta este ID-ul prețios al clientului (ex: acct_1Hxyz...)
    const connectedAccountId = data.stripe_user_id;

    // 2. Salvăm acest ID în baza ta de date
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Utilizatorul nu este logat.");

    // Actualizăm tabela client_settings pentru acest user
    const { error: dbError } = await supabase
      .from("client_settings")
      .update({ stripe_account_id: connectedAccountId }) // Asigură-te că ai creat coloana asta în tabelă!
      .eq("profile_id", user.id);

    if (dbError) throw dbError;

    // 3. Trimitem utilizatorul înapoi pe Dashboard cu succes
    return NextResponse.redirect(new URL("/dashboard?success=stripe_connected", request.url));

  } catch (error) {
    console.error("Eroare severă la salvarea contului Stripe:", error);
    return NextResponse.redirect(new URL("/dashboard?error=server_error", request.url));
  }
}