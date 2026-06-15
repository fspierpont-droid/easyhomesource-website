# Easy HomeSource Website

A public-facing Next.js marketing website for Easy HomeSource, a manufactured home dealership in Brooksville, Florida. This site is separate from the internal EHS portal and does not include CRM or quoting features.

## Tech stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Vercel-ready scripts

## Lead webhook

Set `NEXT_PUBLIC_GHL_WEBHOOK_URL` to post lead form submissions to a GoHighLevel webhook. If the variable is not set, the form displays a local success message for development and demos.

## Commands

```bash
npm install
npm run dev
npm run build
```
