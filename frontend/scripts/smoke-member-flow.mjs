const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const checks = [
  {
    name: "pricing",
    path: "/pricing",
    markers: [
      "Zmarty plans for intelligence, data, and API access",
      "/login?next=%2Faccount%3Fview%3Dtiers",
    ],
  },
  {
    name: "login-tier-entry",
    path: "/login?next=%2Faccount%3Fview%3Dtiers",
    markers: [
      "Enter the protected Zmarty platform.",
      "Create your member account.",
      "Go to tier zone",
    ],
  },
  {
    name: "account-tier-zone",
    path: "/account?view=tiers",
    markers: ["Loading account", "Sign in to continue into the member app", "Account, billing, and API access"],
    match: "any",
  },
];

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "follow",
    headers: {
      "user-agent": "zmarty-smoke/1.0",
    },
  });

  const text = await response.text();
  return { response, text };
}

function assertMarkers(name, path, text, markers, match = "all") {
  const matched = markers.filter((marker) => text.includes(marker));
  const okay = match === "any" ? matched.length > 0 : matched.length === markers.length;

  if (!okay) {
    throw new Error(
      `${name} failed for ${path}. Expected ${match === "any" ? "one of" : "all"}: ${markers.join(" | ")}`,
    );
  }
}

async function main() {
  const results = [];

  for (const check of checks) {
    const { response, text } = await fetchText(check.path);
    if (!response.ok) {
      throw new Error(`${check.name} failed for ${check.path} with HTTP ${response.status}`);
    }

    assertMarkers(check.name, check.path, text, check.markers, check.match);
    results.push(`${check.name}: ${response.status}`);
  }

  console.log(`Smoke member flow passed against ${baseUrl}`);
  for (const line of results) {
    console.log(`- ${line}`);
  }
}

main().catch((error) => {
  console.error(`Smoke member flow failed against ${baseUrl}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
