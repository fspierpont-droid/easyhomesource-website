import { NextResponse } from "next/server";

const consentTextInformational = "I agree to receive informational calls and text messages from Easy HomeSource about my inquiry, quotes, appointments, financing, delivery and setup, and project updates. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help.";
const consentTextMarketing = "I agree to receive marketing calls and text messages from Easy HomeSource about homes, promotions, events, and homeownership opportunities. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.";

export async function POST(request: Request) {
  const body = await request.json();
  const payload = {
    firstName: body.firstName ?? "", lastName: body.lastName ?? "", phone: body.phone ?? "", email: body.email ?? "",
    interestedHome: body.interestedHome ?? "", interestedHomeSlug: body.interestedHomeSlug ?? "", sourcePage: body.sourcePage ?? "", sourceUrl: body.sourceUrl ?? "",
    ownsLand: body.ownsLand ?? "", preferredContactMethod: body.preferredContactMethod ?? "", timeline: body.timeline ?? "", financingInterest: body.financingInterest ?? "", message: body.message ?? "",
    smsInformationalConsent: Boolean(body.smsInformationalConsent), smsMarketingConsent: Boolean(body.smsMarketingConsent), consentTextInformational, consentTextMarketing,
    submittedAt: new Date().toISOString(), userAgent: request.headers.get("user-agent") ?? body.userAgent ?? ""
  };
  if (process.env.NODE_ENV !== "production") console.info("Easy HomeSource lead inquiry captured locally while CRM integration is paused:", payload);
  return NextResponse.json({ ok: true, message: "Thanks! Your request has been captured. If you need immediate help, call or text 352-558-8888." });
}
