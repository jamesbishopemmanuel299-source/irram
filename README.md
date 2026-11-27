# IRRAM AI

IRRAM AI is a responsive AI-assisted crypto research and paper-trading workspace.

## Deploy on Render

1. Sign in to [Render](https://render.com/).
2. Choose **New → Blueprint**.
3. Connect the GitHub repository `jamesbishopemmanuel299-source/irram`.
4. Render detects `render.yaml` and creates the `irram-ai` web service.
5. Open the service's **Environment** page and add:
   - `OPENAI_API_KEY` — your OpenAI API key.
   - `DERIV_API_TOKEN` — your Deriv personal API token. Use read-only permission only.
6. Save changes and wait for deployment. Render will provide your live `onrender.com` URL.

The site and its API run on the same Render service. The server serves the dashboard and handles `POST /chat` and `POST /deriv/otp`. API keys are read only from Render environment variables and are never embedded in browser JavaScript.

## Features

- Responsive crypto market dashboard and watchlist.
- AI market research chat through the server-side OpenAI API.
- Deriv account balance connection using a temporary WebSocket OTP.
- Paper trading, portfolio tracking, trade history and risk calculator.
- Health endpoint at `/health`.

## Local development

Requires Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:10000`. Set `OPENAI_API_KEY` and `DERIV_API_TOKEN` in your local environment to enable the corresponding server features.

## Security

- Never commit API keys or paste them into the website source.
- Set secrets in Render → your service → Environment.
- Use a Deriv token with **read** permission only. The backend reads `DERIV_API_TOKEN` from Render's environment and uses it only to request a temporary session for account-balance viewing. There are no live buy, sell, contract, deposit or withdrawal API routes.
- The dashboard's buy/sell controls are paper trades only.
- Do not share your Render environment values publicly.

## GitHub Actions

GitHub Actions performs a Node.js syntax check. Render handles deployment automatically when the repository is connected and auto-deploy is enabled. Cloudflare credentials are no longer required.
