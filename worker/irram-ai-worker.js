const cors = origin => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(env.ALLOWED_ORIGIN || "*");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (url.pathname === "/deriv/otp" && request.method === "POST") {
      if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) return Response.json({ error: "Origin not allowed." }, { status: 403, headers });
      if (!env.DERIV_API_TOKEN) return Response.json({ error: "Deriv API token is not configured on the server." }, { status: 503, headers });
      try {
        const body = await request.json();
        const appId = String(body.appId || "").trim();
        const accountId = String(body.accountId || "").trim();
        if (!/^\\d{1,20}$/.test(appId) || !/^[A-Za-z0-9]{3,32}$/.test(accountId)) return Response.json({ error: "A valid Deriv App ID and account ID are required." }, { status: 400, headers });
        const upstream = await fetch("https://api.derivws.com/trading/v1/options/accounts/" + encodeURIComponent(accountId) + "/otp", {
          method: "POST",
          headers: { "Authorization": "Bearer " + env.DERIV_API_TOKEN, "Deriv-App-ID": appId, "Content-Type": "application/json" }
        });
        const data = await upstream.json();
        if (!upstream.ok) return Response.json({ error: data.errors?.[0]?.message || data.error?.message || "Deriv authentication failed." }, { status: upstream.status, headers });
        return Response.json(data, { headers });
      } catch {
        return Response.json({ error: "Unable to create a Deriv session." }, { status: 500, headers });
      }
    }
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return Response.json({ error: "Use POST /chat" }, { status: 404, headers });
    }
    if (!env.OPENAI_API_KEY) return Response.json({ error: "Server AI key is not configured." }, { status: 503, headers });
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return Response.json({ error: "Origin not allowed." }, { status: 403, headers });
    }
    try {
      const body = await request.json();
      const message = String(body.message || "").slice(0, 4000);
      if (!message.trim()) return Response.json({ error: "Message is required." }, { status: 400, headers });
      const history = Array.isArray(body.history) ? body.history.slice(-10).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 3000)
      })) : [];
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { role: "system", content: "You are IRRAM AI, a careful crypto market research assistant. Explain market concepts and risk management. Do not guarantee returns, fabricate live prices, or claim to execute trades. State uncertainty and distinguish educational analysis from personalized financial advice. Never ask users to reveal exchange passwords or API secrets." },
            ...history,
            { role: "user", content: message }
          ]
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return Response.json({ error: data.error?.message || "AI provider request failed." }, { status: upstream.status, headers });
      const reply = data.choices?.[0]?.message?.content || "No response was returned.";
      return Response.json({ reply }, { headers });
    } catch (error) {
      return Response.json({ error: "Unable to process the AI request." }, { status: 500, headers });
    }
  }
};
