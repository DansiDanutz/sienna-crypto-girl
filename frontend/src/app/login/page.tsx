import AuthPanel from "@/components/AuthPanel";
import BackActions from "@/components/BackActions";

export const metadata = {
  title: "Login | Zmarty",
  description: "Login or create a Zmarty account for member access, billing, and analytics API tiers.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const requestedPlan = typeof params.plan === "string" ? params.plan : undefined;
  const allowedPlan = requestedPlan === "gold" || requestedPlan === "premium" ? requestedPlan : null;

  let nextPath = "/account?view=tiers";
  if (rawNext && rawNext.startsWith("/")) {
    nextPath = rawNext;
  } else if (allowedPlan) {
    nextPath = `/account?view=tiers&plan=${allowedPlan}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <BackActions fallbackHref="/pricing" homeHref="/" backLabel="Back" />
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={nextPath}
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100"
          >
            Open app
          </a>
          <a
            href="/account?view=tiers"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to tier zone
          </a>
        </div>
        <AuthPanel nextPath={nextPath} />
      </div>
    </main>
  );
}
