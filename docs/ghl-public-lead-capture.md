# GoHighLevel public lead capture

The public Easy HomeSource website uses the approved GoHighLevel form:

`https://links.framelitmedia.com/widget/form/rdWwyO5p9cn3CTEQlmAG`

This integration applies only to the public `/get-quote` lead-capture page. It does not replace or modify the internal quote portal, pricing engine, PDF generation, authentication, or catalog administration.

## Vercel configuration

Set the following environment variable in Vercel for each environment that should use the GHL form, then redeploy:

```text
NEXT_PUBLIC_GHL_FORM_URL=https://links.framelitmedia.com/widget/form/rdWwyO5p9cn3CTEQlmAG
```

When the variable contains a valid HTTPS URL, `/get-quote` embeds that form. When it is absent or invalid, the existing website lead form remains available as the fallback. Confirm both production and preview environment settings explicitly; do not describe GHL as connected when the iframe is not in use.

## Expected flow

1. A visitor follows a website sales CTA to `/get-quote`.
2. The visitor submits the embedded GHL form.
3. GHL creates or updates the contact and associated opportunity according to the approved GHL workflow.
4. Sales receives the opportunity and follows up with the lead.

## Consent requirement

The following language must remain visible near the form, together with links to the Privacy Policy and Terms & Conditions:

> By submitting this form, you agree that Easy HomeSource may contact you by phone, text, or email about your inquiry. Message and data rates may apply. Reply STOP to opt out.

## Interested-home attribution

The website displays the selected home above the form so the visitor retains context even if GHL ignores URL parameters. The embed currently appends safe `home`, `source`, and `cta` query parameters when available. GHL is not required to accept these parameters.

As a future enhancement, corresponding custom fields can be created and mapped in GHL so interested home, website source, and CTA values are reliably captured in the contact or opportunity. That field mapping should be tested in GHL before the values are treated as part of the sales workflow.
