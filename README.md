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