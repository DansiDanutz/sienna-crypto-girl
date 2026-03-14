import AuthCallbackBridge from "@/components/AuthCallbackBridge";

function resolveNextPath(rawNext: string | undefined) {
  if (rawNext && rawNext.startsWith("/")) {
    return rawNext;
  }
  return "/account";
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const nextPath = resolveNextPath(rawNext);

  return <AuthCallbackBridge nextPath={nextPath} />;
}
