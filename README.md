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

## Enable the real AI assistant (optional)
The site includes a secure Cloudflare Worker in worker/irram-ai-worker.js. The browser sends chat messages to that Worker; the OpenAI key stays on the server and is never embedded in the website.

1. Create a Cloudflare Worker and deploy worker/irram-ai-worker.js (or use Wrangler).
2. In the Worker settings, add the secret OPENAI_API_KEY. Optionally add OPENAI_MODEL (default: gpt-4o-mini) and ALLOWED_ORIGIN (the exact published site origin, for example https://jamesbishopemmanuel299-source.github.io).
3. Open IRRAM AI, choose Connect AI, and paste the Worker URL. The assistant will use the configured AI endpoint. Leave it blank to use local educational research responses.

Never put an OpenAI key in the website, GitHub Pages files, or browser storage. Only the public Worker URL belongs in the browser. The Worker restricts cross-origin requests when ALLOWED_ORIGIN is configured.

## Connect a Deriv account (read-only)
The dashboard includes an optional Deriv account connection for live account-balance monitoring. It uses Deriv's authenticated WebSocket OTP flow.

1. Register your application in the Deriv developer portal and copy its App ID.
2. In Deriv, create a Personal API token with **read-only** permission. Do not enable trade or payment permissions for this connection.
3. Enter the App ID, your Deriv account ID, and the read-only token in the Deriv panel on IRRAM AI.
4. Select **Connect Deriv**. The page requests a temporary WebSocket URL from Deriv and subscribes to balance updates.
5. Select **Disconnect** when finished.

The token is sent directly from the browser to Deriv's OTP endpoint, is cleared from the token input after the request, and is not written to localStorage. Only use this on a trusted device. This integration is deliberately read-only: it does not submit, buy, sell, or close live contracts. The existing IRRAM buy/sell controls remain paper-trading only.
