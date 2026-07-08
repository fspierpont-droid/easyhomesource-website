import { NextResponse } from "next/server";

const consentTextContact = "I agree to be contacted by Easy HomeSource by phone, text, or email about my home inquiry. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out.";
const consentTextMarketing = "I agree to receive occasional promotional messages from Easy HomeSource about homes, pricing, and offers.";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    phone: clean(body.phone),
    email: clean(body.email),
    preferredContactMethod: clean(body.preferredContactMethod),
    interestedHome: clean(body.interestedHome),
    interestedHomeSlug: clean(body.interestedHomeSlug),
    landStatus: clean(body.landStatus),
    city: clean(body.city),
    county: clean(body.county),
    financingInterest: clean(body.financingInterest),
    deliverySetupHelp: clean(body.deliverySetupHelp),
    message: clean(body.message),
    smsContactConsent: Boolean(body.smsContactConsent),
    smsMarketingConsent: Boolean(body.smsMarketingConsent),
    consentTextContact,
    consentTextMarketing,
    sourcePage: clean(body.sourcePage),
    sourceUrl: clean(body.sourceUrl),
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? clean(body.userAgent)
  };

  if (!payload.firstName || !payload.lastName || (!payload.phone && !payload.email) || !payload.smsContactConsent) {
    return NextResponse.json({ ok: false, message: "Missing required quote request fields." }, { status: 400 });
  }

  // TODO: Send this normalized payload to GHL, email, or the selected lead provider after that integration is approved.
  if (process.env.NODE_ENV !== "production") console.info("Easy HomeSource quote/contact request captured locally while CRM integration is paused:", payload);

  return NextResponse.json({ ok: true, message: "Thanks — your request has been received." });
}
