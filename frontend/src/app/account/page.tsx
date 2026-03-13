import AccountPanel from "@/components/AccountPanel";
import BackActions from "@/components/BackActions";

export const metadata = {
  title: "Account | Zmarty",
  description: "Manage your Zmarty subscription, billing, and member API keys for analytics access.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : undefined;
  const rawPlan = typeof params.plan === "string" ? params.plan : undefined;
  const rawCheckout = typeof params.checkout === "string" ? params.checkout : undefined;

  const tiersOnly = view === "tiers";
  const requestedPlan = rawPlan === "gold" || rawPlan === "premium" ? rawPlan : null;
  const checkoutStatus =
    rawCheckout === "success" || rawCheckout === "cancelled" ? rawCheckout : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <BackActions fallbackHref="/pricing" homeHref="/" backLabel="Back" />
        <AccountPanel
          tiersOnly={tiersOnly}
          requestedPlan={requestedPlan}
          checkoutStatus={checkoutStatus}
        />
      </div>
    </main>
  );
}
