# Easy HomeSource Website

A public-facing Next.js marketing website for Easy HomeSource, a manufactured home dealership in Brooksville, Florida. This site is separate from the internal EHS portal and does not include CRM or quoting features.

## Tech stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Vercel-ready scripts

## Lead email notifications

The Get Quote form posts normalized lead data to `/api/leads`. GHL is intentionally not connected yet; the route keeps an adapter boundary for a future GHL integration.

Configure the server-side email provider with environment variables:

- `EHS_LEAD_EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=`
- `EHS_LEAD_EMAIL_TO=` (comma-separated recipient list is supported)
- `EHS_LEAD_EMAIL_FROM=`
- `EHS_LEAD_EMAIL_REPLY_TO=` (optional fallback; the customer email is used when provided)

If these variables are not configured, lead delivery fails loudly so submissions are not silently acknowledged without a delivery path.

## Commands

```bash
npm install
npm run dev
npm run build
```
