import { NextRequest } from "next/server";
import { getSupabasePublicServerClient } from "@/lib/supabase-admin";

export interface AuthenticatedMember {
  id: string;
  email: string;
}

export class MemberAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "MemberAuthError";
    this.status = status;
  }
}

function extractBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export async function requireAuthenticatedMember(request: NextRequest): Promise<AuthenticatedMember> {
  const token = extractBearerToken(request);

  if (!token) {
    throw new MemberAuthError("Missing bearer token.", 401);
  }

  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.id || !data.user.email) {
    throw new MemberAuthError("Invalid session.", 401);
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}
