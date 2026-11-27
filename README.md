# IRRAM AI

A responsive AI-assisted crypto research and paper-trading workspace with a ChatGPT-style interface.

## Features
- Public CoinGecko market quotes and recent price history, with indicative demo quotes if the feed is unavailable.
- Trading research chat for market summaries, indicator education, strategy process and portfolio review.
- Interactive watchlist and price chart.
- Local paper account with buy/sell orders, open positions, realized/unrealized P&L and trade history.
- Position-size risk calculator.
- Paper account stored in the browser's local storage.

## Run locally
Open index.html in a modern browser. No build step or package installation is required.

## Publish with GitHub Pages
The included GitHub Actions workflow publishes the repository root. In repository Settings > Pages, choose GitHub Actions as the build and deployment source.

## Important limitations
- This is a paper-trading and educational research tool. It does not connect to a broker or place real-money orders.
- The built-in assistant uses rule-based educational responses; it is not a hosted ChatGPT model. To add a real AI model safely, connect a server-side API endpoint and store provider credentials only as server-side secrets. Never put API keys in browser JavaScript.
- Public market data may be delayed, rate-limited or unavailable. Fallback quotes are sample values, not live prices.
- Paper trades are stored locally in the current browser and are not synced across devices.
- Trading involves risk. Nothing in this app is a personalized investment recommendation.

## Enable secure live AI chat through GitHub

The live-chat API key is never placed in the browser or GitHub Pages output. GitHub Actions reads `OPENAI_API_KEY` as a secret and installs it as a Cloudflare Worker secret during deployment. The browser receives only the public Worker URL.

Add these repository **Actions secrets** in Settings → Secrets and variables → Actions:

- `OPENAI_API_KEY` — your OpenAI API key.
- `DERIV_API_TOKEN` — your Deriv personal API token. Use read-only permissions only; do not grant trade or payment permissions.
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers Scripts edit permission.
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID.

Add this repository **Actions variable** in the same page:

- `IRRAM_CHAT_API_URL` — your deployed Worker URL, for example `https://irram-ai.YOUR-SUBDOMAIN.workers.dev` (no trailing slash).

The workflow deploys `worker/irram-ai-worker.js` using `worker/wrangler.toml`, stores the OpenAI and Deriv keys as Worker secrets, generates the public endpoint configuration, and deploys GitHub Pages. The Deriv UI sends only the App ID and account ID to the Worker; the Worker uses `DERIV_API_TOKEN` to request the temporary WebSocket session. The token is never sent to the browser. If any required value is missing, deployment stops with a clear error. Never add the API key to `index.html`, `chat-config.js`, or any committed file.

## Connect a Deriv account (read-only)
The dashboard includes an optional Deriv account connection for live account-balance monitoring. It uses Deriv's authenticated WebSocket OTP flow.

1. Register your application in the Deriv developer portal and copy its App ID.
2. In Deriv, create a Personal API token with **read-only** permission. Do not enable trade or payment permissions for this connection.
3. Enter the App ID, your Deriv account ID, and the read-only token in the Deriv panel on IRRAM AI.
4. Select **Connect Deriv**. The page requests a temporary WebSocket URL from Deriv and subscribes to balance updates.
5. Select **Disconnect** when finished.

The token is sent directly from the browser to Deriv's OTP endpoint, is cleared from the token input after the request, and is not written to localStorage. Only use this on a trusted device. This integration is deliberately read-only: it does not submit, buy, sell, or close live contracts. The existing IRRAM buy/sell controls remain paper-trading only.
