import { NextRequest, NextResponse } from "next/server";
import { ensureMemberProfile } from "@/lib/member-data";
import { MemberAuthError, requireAuthenticatedMember } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripeClient } from "@/lib/stripe";

function appBaseUrl(request: NextRequest) {
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "billing-portal", 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many portal requests. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const profile = await ensureMemberProfile(member.id, member.email);

    if (!profile.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer is linked to this account." }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appBaseUrl(request)}/account`,
    });

    return NextResponse.json({
      portalUrl: session.url,
    });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create billing portal session." },
      { status: 500 },
    );
  }
}
