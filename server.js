import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 10000);
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".ico":"image/x-icon" };

function send(res, status, data, type="application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) throw new Error("Request body is too large.");
  }
  return JSON.parse(raw || "{}");
}
async function api(req, res, url) {
  if (!sameOrigin(req)) return send(res, 403, { error:"Origin not allowed." });
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Methods":"POST, OPTIONS", "Access-Control-Allow-Headers":"Content-Type" }); return res.end(); }

  if (url.pathname === "/chat" && req.method === "POST") {
    if (!process.env.OPENAI_API_KEY) return send(res, 503, { error:"OPENAI_API_KEY is not configured in Render environment variables." });
    try {
      const body = await readBody(req);
      const message = String(body.message || "").slice(0, 4000);
      if (!message.trim()) return send(res, 400, { error:"Message is required." });
      const history = Array.isArray(body.history) ? body.history.slice(-10).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 3000)
      })) : [];
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method:"POST",
        headers:{ "Authorization":"Bearer " + process.env.OPENAI_API_KEY, "Content-Type":"application/json" },
        body:JSON.stringify({
          model:process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature:0.3,
          messages:[
            { role:"system", content:"You are IRRAM AI, a careful crypto market research assistant. Explain market concepts and risk management. Do not guarantee returns, fabricate live prices, or claim to execute trades. State uncertainty and distinguish educational analysis from personalized financial advice. Never ask users to reveal exchange passwords or API secrets." },
            ...history,
            { role:"user", content:message }
          ]
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return send(res, upstream.status, { error:data.error?.message || "AI provider request failed." });
      return send(res, 200, { reply:data.choices?.[0]?.message?.content || "No response was returned." });
    } catch (e) { return send(res, 500, { error:e.message || "Unable to process the AI request." }); }
  }

  if (url.pathname === "/deriv/otp" && req.method === "POST") {
    if (!process.env.DERIV_API_TOKEN) return send(res, 503, { error:"DERIV_API_TOKEN is not configured in Render environment variables." });
    try {
      const body = await readBody(req);
      const appId = String(body.appId || "").trim();
      const accountId = String(body.accountId || "").trim();
      if (!/^\d{1,20}$/.test(appId) || !/^[A-Za-z0-9]{3,32}$/.test(accountId)) {
        return send(res, 400, { error:"A valid Deriv App ID and account ID are required." });
      }
      const upstream = await fetch("https://api.derivws.com/trading/v1/options/accounts/" + encodeURIComponent(accountId) + "/otp", {
        method:"POST",
        headers:{ "Authorization":"Bearer " + process.env.DERIV_API_TOKEN, "Deriv-App-ID":appId, "Content-Type":"application/json" }
      });
      const data = await upstream.json();
      if (!upstream.ok) return send(res, upstream.status, { error:data.errors?.[0]?.message || data.error?.message || "Deriv authentication failed." });
      return send(res, 200, data);
    } catch (e) { return send(res, 500, { error:"Unable to create a Deriv session." }); }
  }
  return send(res, 404, { error:"API route not found." });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (url.pathname === "/health") return send(res, 200, { status:"ok", service:"IRRAM AI" });
  if (url.pathname === "/chat" || url.pathname === "/deriv/otp") return api(req, res, url);
  if (url.pathname === "/chat-config.js") {
    return send(res, 200, "window.IRRAM_CHAT_API_URL = window.location.origin;\n", "text/javascript; charset=utf-8");
  }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return send(res, 400, { error:"Bad path." }); }
  if (pathname === "/") pathname = "/index.html";
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep)) return send(res, 403, { error:"Forbidden." });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error:"Not found." });
    const type = mime[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type":type, "X-Content-Type-Options":"nosniff" });
    res.end(data);
  });
});
server.listen(port, "0.0.0.0", () => console.log("IRRAM AI listening on " + port));
