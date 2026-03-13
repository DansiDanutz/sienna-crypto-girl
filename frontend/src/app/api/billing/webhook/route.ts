import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateMemberSubscription } from "@/lib/member-data";
import { getStripeClient } from "@/lib/stripe";
import { tierForStripePriceId, type SubscriptionStatus } from "@/lib/tiers";

function currentPeriodEnd(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
    : null;
}

function priceIdFromSubscription(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id ?? null;
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) {
    return;
  }

  const priceId = priceIdFromSubscription(subscription);
  const tier = tierForStripePriceId(priceId);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;

  await updateMemberSubscription({
    userId,
    tier,
    subscriptionStatus: subscription.status as SubscriptionStatus,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodEnd: currentPeriodEnd(subscription),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const stripe = getStripeClient();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.subscription || !session.metadata?.user_id) break;

        const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
        const tier = tierForStripePriceId(priceIdFromSubscription(subscription));

        await updateMemberSubscription({
          userId: session.metadata.user_id,
          tier,
          subscriptionStatus: subscription.status as SubscriptionStatus,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceIdFromSubscription(subscription),
          currentPeriodEnd: currentPeriodEnd(subscription),
        });

        // Log the OpenClaw activation prompt for this new subscriber
        console.log(
          `[Zmarty] New ${tier} subscriber: ${session.metadata.user_id}. ` +
          `After generating their API key in the member area, they can activate OpenClaw integration with: ` +
          `claude /zmarty-connect zm_<THEIR_KEY>`
        );
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;
        if (!userId) break;
        await updateMemberSubscription({
          userId,
          tier: "free",
          subscriptionStatus: "canceled",
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null,
          stripeSubscriptionId: subscription.id,
          stripePriceId: null,
          currentPeriodEnd: null,
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
