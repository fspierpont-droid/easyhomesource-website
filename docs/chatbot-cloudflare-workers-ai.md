# EHS Website AI — Cloudflare Workers AI

## Purpose

The Easy HomeSource website sales assistant uses Cloudflare Workers AI as its inference provider and keeps the existing EHS server-side catalog/dealership tools and controlled quote/tour handoff behavior.

The production model defaults to:

`@cf/qwen/qwen3-30b-a3b-fp8`

This model supports multi-turn chat and function calling. The EHS application calls Cloudflare's OpenAI-compatible `/ai/v1/chat/completions` endpoint directly from the server; no browser credential is exposed.

## Required Vercel environment variables

- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID that owns Workers AI.
- `CLOUDFLARE_AI_API_TOKEN` — Cloudflare Workers AI API token. Keep server-only and never expose it with a `NEXT_PUBLIC_` prefix.
- `EHS_CHAT_MODEL` — optional model override. If omitted, EHS uses `@cf/qwen/qwen3-30b-a3b-fp8`.

Do not commit account IDs or API tokens to GitHub source.

## No-surprise-billing operating rule

Keep the Cloudflare account on the Workers Free plan for this EHS assistant unless ownership explicitly approves a paid plan. The application has no OpenAI/Vercel paid-model fallback. If Workers AI is unavailable, misconfigured, rate-limited, or the free allocation is exhausted, the chat route fails closed to the existing customer-safe offline message instead of silently switching to a billable provider.

## Agent behavior preserved

The provider migration does not change the business behavior of the EHS agent. It still:

- keeps recent conversation history;
- searches only the verified EHS home catalog for home facts;
- retrieves verified dealership hours/contact details;
- distinguishes on-display homes from catalog/order models;
- does not invent site-work, permitting, financing, availability, or final pricing facts;
- opens quote UI only after explicit quote intent;
- opens tour UI only after explicit scheduling intent;
- returns a customer-safe offline response if AI inference fails.

## Cloudflare setup

From the Cloudflare dashboard, open Workers AI and choose the REST API setup flow. Create a Workers AI API token using Cloudflare's prefilled token flow and copy the Account ID. Store those two values in the Vercel project environment using the names above.

After adding or changing the Vercel environment values, redeploy the website before runtime testing.

## Runtime verification

Verify at minimum:

1. `What time do you open?` — should use verified dealership information.
2. `Tell me about Timber Creek Lake Wood.` — should resolve the home through catalog tools rather than guess.
3. `I need a 3 bedroom under $120,000.` — should search the catalog and hold a normal conversation.
4. Follow-up: `I already own land.` — should preserve prior context.
5. `Can someone put together a quote for me?` — should open the quote-request UI only now.
6. Missing/invalid Cloudflare credentials — should return the safe offline response and never a canned fake-AI answer.

## Security boundary

The public browser calls `/api/chat`. Cloudflare credentials stay in the server runtime. Tool execution happens inside the EHS server route and exposes only approved catalog/dealership results to the model. The model cannot directly access MongoDB, GHL, private portal data, Home Inventory documents, AMHI records, authentication data, or arbitrary URLs.
