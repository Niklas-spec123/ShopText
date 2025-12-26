import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = createSupabaseServerClient();

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Säkerställ att profil finns (INGEN select här)
  const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      plan: "free",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    console.error("PROFILE UPSERT ERROR", upsertError);
    return NextResponse.json(
      { error: "Failed to ensure profile" },
      { status: 500 }
    );
  }

  // 3. Hämta profilen separat (tillåten SELECT)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("PROFILE FETCH ERROR", profileError);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }

  // 4. Stripe customer
  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });

    customerId = customer.id;

    await supabaseAdmin
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  // 5. Checkout session (endast månads-Pro)
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        userId: user.id, // 🔥 KRITISK RAD
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
