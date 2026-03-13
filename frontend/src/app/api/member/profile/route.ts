import { NextRequest, NextResponse } from "next/server";
import { ensureMemberProfile } from "@/lib/member-data";
import { MemberAuthError, requireAuthenticatedMember } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "member-profile", 60, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many profile requests. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const profile = await ensureMemberProfile(member.id, member.email);

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load member profile." },
      { status: 500 },
    );
  }
}
