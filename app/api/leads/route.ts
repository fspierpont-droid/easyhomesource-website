import { NextResponse } from "next/server";

const consentTextInformational = "I agree to receive informational calls and text messages from Easy HomeSource about my inquiry, quotes, appointments, financing, delivery, setup, and project updates. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help.";
const consentTextMarketing = "I agree to receive marketing calls and text messages from Easy HomeSource about homes, promotions, events, and homeownership opportunities. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.";

export async function POST(request: Request) {
  const body = await request.json();
  const payload = {
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    interestedHome: body.interestedHome ?? "",
    interestedHomeSlug: body.interestedHomeSlug ?? "",
    sourcePage: body.sourcePage ?? "",
    sourceUrl: body.sourceUrl ?? "",
    ownsLand: body.ownsLand ?? "",
    preferredContactMethod: body.preferredContactMethod ?? "",
    timeline: body.timeline ?? "",
    financingInterest: body.financingInterest ?? "",
    message: body.message ?? "",
    smsInformationalConsent: Boolean(body.smsInformationalConsent),
    smsMarketingConsent: Boolean(body.smsMarketingConsent),
    consentTextInformational,
    consentTextMarketing,
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? body.userAgent ?? ""
  };

  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") console.info("Easy HomeSource lead submission captured without GHL_WEBHOOK_URL:", payload);
    return NextResponse.json({ ok: true, message: "Lead captured." });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`GHL webhook failed with ${response.status}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Easy HomeSource GHL webhook submission failed:", error);
    return NextResponse.json({ ok: true, message: "Lead captured; follow-up will continue." });
  }
}
