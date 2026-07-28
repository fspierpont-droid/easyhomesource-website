# GoHighLevel public website lead capture plan

## Scope and current state

The public Easy HomeSource website should be the customer-facing entry point for quote, pricing, tour, and general information requests. Customer lead CTAs should send visitors to `/get-quote`, except financing education links that intentionally use `/financing` and general-contact links that intentionally use `/contact`.

No approved GoHighLevel (GHL) form URL, embed code, webhook URL, credentials, pipeline, or field mapping is available in this repository. Until those details are approved, the visible website form remains usable through the existing email-backed `/api/leads` endpoint. That temporary delivery path must not be described as a GHL submission.

The integration seam is the submit call in `components/LeadForm.tsx` and the normalized lead routing function in `app/api/leads/route.ts`. Replace or extend that seam rather than connecting the public site to the internal quote portal or backend quote system.

## Preferred lead flow

1. A visitor follows a public CTA to `/get-quote`, optionally with a selected home in the `home` query parameter.
2. The visitor submits the website form with explicit contact consent.
3. The approved integration sends the normalized payload to a GHL-hosted form or authenticated webhook.
4. GHL creates or updates the contact, then creates or updates an opportunity in the approved sales pipeline.
5. Only after GHL confirms successful receipt should the website show a successful submission state. Failures should preserve the form and offer direct phone/email contact instead of implying that GHL received the lead.

Do not invent a form ID, embed URL, webhook, API key, location ID, pipeline ID, stage ID, tag, or custom-field ID. Store all secrets server-side and keep them out of client bundles and source control.

## Required lead fields

Map and test these fields before enabling the GHL delivery path:

| Website data | GHL destination |
| --- | --- |
| First and last name | Contact name fields |
| Phone | Contact phone |
| Email | Contact email |
| Interested home/model and slug | Approved contact/opportunity custom fields |
| Land status | Approved contact/opportunity custom field |
| Financing interest | Approved contact/opportunity custom field |
| Message | Contact note or opportunity note |
| Source page and source URL | Attribution/source fields or note |

The current form also collects preferred contact method, city, county, and delivery/setup interest. Preserve these when the approved GHL field mapping supports them. Include a server-generated submission timestamp and retain consent evidence appropriate to the approved compliance policy.

## Consent requirements

The form must display unchecked, affirmative consent controls and preserve the exact language shown when the lead submits. The current required contact consent covers follow-up by phone, text, or email and states that message/data rates may apply, frequency may vary, and `STOP` opts out. Promotional messaging has a separate optional checkbox.

Before launch, the business/compliance owner should approve the final SMS and email language, privacy policy, terms, sender identity, opt-out instructions, and whether consent for a transactional inquiry may be required. Marketing consent must remain optional and must not be bundled with the inquiry. Map both consent booleans, the displayed consent text, timestamp, and source URL into GHL fields or auditable notes as approved.

## Future GHL workflow

Once GHL configuration is approved:

1. Deduplicate contacts using normalized email and phone according to the approved policy.
2. Apply approved source and intent tags (for example, website lead, pricing request, tour request, financing interest, and interested-home identifiers). Final tag names must come from the GHL administrator.
3. Create or update an opportunity in the approved pipeline and initial stage; avoid duplicate open opportunities according to the sales team's rules.
4. Assign the contact/opportunity using the approved owner or round-robin workflow.
5. Trigger the approved acknowledgement and staff notification workflows, honoring channel-specific consent.
6. Record delivery failures for retry/alerting without logging secrets or unnecessary personal data.
7. Test field mappings, attribution, deduplication, tags, opportunity creation, consent records, opt-out behavior, and failure handling in a non-production GHL location before launch.

The public lead flow must remain independent of Ready to Quote, internal authentication, Home Inventory, Home Catalog administration, quote pricing, PDF generation, and all backend/internal quote workflows.
