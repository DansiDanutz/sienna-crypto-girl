import { NextRequest, NextResponse } from "next/server";
import { ensureMemberProfile } from "@/lib/member-data";
import { MemberAuthError, requireAuthenticatedMember } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripeClient } from "@/lib/stripe";
import { isPaidTier, stripePriceIdForTier } from "@/lib/tiers";

function appBaseUrl(request: NextRequest) {
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "billing-checkout", 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many checkout attempts. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const profile = await ensureMemberProfile(member.id, member.email);
    const body = await request.json();
    const plan = typeof body.plan === "string" ? body.plan : "";

    if (!isPaidTier(plan)) {
      return NextResponse.json({ error: "Invalid paid plan." }, { status: 400 });
    }

    const priceId = stripePriceIdForTier(plan);
    if (!priceId) {
      return NextResponse.json({ error: `Stripe price ID is not configured for ${plan}.` }, { status: 500 });
    }

    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve();
    if (!account.charges_enabled) {
      return NextResponse.json(
        {
          error:
            "Stripe live charges are not active on this account yet. Complete Stripe activation or verification before accepting paid subscriptions.",
        },
        { status: 503 },
      );
    }
    const baseUrl = appBaseUrl(request);

    const customer =
      profile.stripe_customer_id ||
      (
        await stripe.customers.create({
          email: member.email,
          metadata: { user_id: member.id },
        })
      ).id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/account?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      metadata: {
        user_id: member.id,
        tier: plan,
      },
      subscription_data: {
        metadata: {
          user_id: member.id,
          tier: plan,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
