// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  /* ============================
     CHECKOUT COMPLETED → PRO
  ============================ */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string | null;

    if (customerId) {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "pro",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  /* ============================
     SUBSCRIPTION UPDATED
  ============================ */
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription & {
      current_period_end?: number;
    };

    const customerId = subscription.customer as string;

    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    if (customerId) {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: subscription.status === "active" ? "pro" : "free",
          stripe_subscription_id: subscription.id,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  /* ============================
     SUBSCRIPTION DELETED → FREE
  ============================ */
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    if (customerId) {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "free",
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
