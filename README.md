# Easy HomeSource Website

A public-facing Next.js marketing website for Easy HomeSource, a manufactured home dealership in Brooksville, Florida. This site is separate from the internal EHS portal and does not include CRM or quoting features.

## Tech stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Vercel-ready scripts

## Lead webhook

Set `GHL_WEBHOOK_URL=` on the server to post lead form submissions to a GoHighLevel webhook. If the variable is not set, the API logs submissions clearly in development and the form displays a safe success message.

## Commands

```bash
npm install
npm run dev
npm run build
```
