# Easy HomeSource Website

A public-facing Next.js marketing website for Easy HomeSource, a manufactured home dealership in Brooksville, Florida. The production site is deployed on Vercel at [easyhomesource.com](https://easyhomesource.com). This site is separate from the internal EHS portal; public lead capture is handled by an embedded GoHighLevel form rather than the portal's quoting workflow.

## Production status

- Public website live on Vercel
- Real Easy HomeSource contact information published
- Real home inventory and starting prices published
- Home walkthrough and lot videos available
- GoHighLevel quote form connected
- Financing inquiries routed through the central lead-capture path
- Expanded public home detail pages available

## Tech stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Vercel-ready scripts

## Public lead capture

`/get-quote` is the central public lead-intake page and embeds the approved GoHighLevel form. Home, source, and CTA context can be passed in the URL and is forwarded to the form embed. Financing calls to action use the same page with `source=financing`.

The older `/api/leads` route remains in the repository as a server-side email adapter, but it is not the public form used by the current website. If that route is used by a future integration, configure it with:

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
