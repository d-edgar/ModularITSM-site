// Cloudflare Worker — deploy this via the Cloudflare dashboard, NOT in your static site.
// This file is just a reference copy.
//
// After creating the Worker, add your GitHub token as a secret:
//   wrangler secret put GITHUB_TOKEN
// Or via the dashboard: Worker → Settings → Variables → Secrets

export default {
  async fetch(request, env) {
    // Only allow POST
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://modularitsm.com",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { email } = await request.json();

      if (!email || !email.includes("@")) {
        return new Response(JSON.stringify({ error: "Invalid email" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create a GitHub Issue as a signup record
      const res = await fetch(
        "https://api.github.com/repos/YOUR_USERNAME/ModularITSM-site/issues",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "ModularITSM-Signup-Worker",
          },
          body: JSON.stringify({
            title: `Early access signup: ${email}`,
            body: `New signup from the coming soon page.\n\n**Email:** ${email}\n**Date:** ${new Date().toISOString()}`,
            labels: ["signup"],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: "GitHub API error" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://modularitsm.com",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
