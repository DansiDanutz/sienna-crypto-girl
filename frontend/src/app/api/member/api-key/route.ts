import { NextRequest, NextResponse } from "next/server";
import {
  createMemberApiKey,
  ensureMemberProfile,
  listMemberApiKeys,
  revokeMemberApiKey,
} from "@/lib/member-data";
import { MemberAuthError, requireAuthenticatedMember } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";

function maskedKey(prefix: string) {
  return `${prefix}••••••••••••`;
}

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "member-api-key-list", 30, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many API key requests. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const profile = await ensureMemberProfile(member.id, member.email);
    const keys = await listMemberApiKeys(member.id);

    return NextResponse.json({
      profile,
      keys: keys.map((key) => ({
        id: key.id,
        label: key.label,
        isActive: key.is_active,
        keyPreview: maskedKey(key.key_prefix),
        lastUsedAt: key.last_used_at,
        createdAt: key.created_at,
        revokedAt: key.revoked_at,
      })),
    });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load API keys." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "member-api-key-create", 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many API key creation attempts. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const profile = await ensureMemberProfile(member.id, member.email);

    if (!profile.api_access_enabled) {
      return NextResponse.json(
        { error: "API access is only enabled for active Gold or Premium members." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const label =
      typeof body.label === "string" && body.label.trim().length > 0 ? body.label.trim() : "Primary key";

    const created = await createMemberApiKey(member.id, label);

    return NextResponse.json({
      key: {
        id: created.record.id,
        label: created.record.label,
        keyPreview: maskedKey(created.record.key_prefix),
        plainTextKey: created.plainTextKey,
      },
    });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create API key." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, "member-api-key-revoke", 20, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many revoke attempts. Try again in a minute." }, { status: 429 });
    }

    const member = await requireAuthenticatedMember(request);
    const body = await request.json();
    const keyId = typeof body.keyId === "string" ? body.keyId : "";

    if (!keyId) {
      return NextResponse.json({ error: "Missing keyId." }, { status: 400 });
    }

    await revokeMemberApiKey(member.id, keyId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revoke API key." },
      { status: 500 },
    );
  }
}
