# GoHighLevel public lead capture

The public Easy HomeSource website uses the approved GoHighLevel form:

`https://links.framelitmedia.com/widget/form/rdWwyO5p9cn3CTEQlmAG`

`/get-quote` is the central public lead-intake page. Financing inquiries route there through `/get-quote?source=financing` and use the same approved GHL form; `/financing` does not maintain a separate lead form. This integration does not replace or modify the internal quote portal, pricing engine, PDF generation, authentication, or catalog administration.

The approved form URL is configured directly in the public quote page so that the website does not fall back to a second native lead form.

## Expected flow

1. A visitor follows a website sales CTA to `/get-quote`.
2. The visitor submits the embedded GHL form.
3. GHL creates or updates the contact and associated opportunity according to the approved GHL workflow.
4. Sales receives the opportunity and follows up with the lead.

## Form presentation and consent

The website provides the responsive card and iframe wrapper. Visual styling for fields inside the iframe must be adjusted in GHL Form Builder. Consent checkboxes and their language are maintained in the GHL form; the website shows only a small Privacy Policy and Terms & Conditions note below it to avoid duplication.

## Interested-home attribution

The website displays the selected home above the form so the visitor retains context even if GHL ignores URL parameters. The embed currently appends safe `home`, `source`, and `cta` query parameters when available. GHL is not required to accept these parameters.

As a future enhancement, corresponding custom fields can be created and mapped in GHL so interested home, website source, and CTA values are reliably captured in the contact or opportunity. That field mapping should be tested in GHL before the values are treated as part of the sales workflow.
