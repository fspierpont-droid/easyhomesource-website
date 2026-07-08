import { NextResponse } from "next/server";

const consentTextContact = "I agree to be contacted by Easy HomeSource by phone, text, or email about my home inquiry. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out.";
const consentTextMarketing = "I agree to receive occasional promotional messages from Easy HomeSource about homes, pricing, and offers.";

type LeadPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContactMethod: string;
  interestedHome: string;
  interestedHomeSlug: string;
  landStatus: string;
  city: string;
  county: string;
  financingInterest: string;
  deliverySetupHelp: string;
  message: string;
  smsContactConsent: boolean;
  smsMarketingConsent: boolean;
  consentTextContact: string;
  consentTextMarketing: string;
  sourcePage: string;
  sourceUrl: string;
  submittedAt: string;
  userAgent: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeLead(body: Record<string, unknown>, request: Request): LeadPayload {
  return {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    phone: clean(body.phone),
    email: clean(body.email).toLowerCase(),
    preferredContactMethod: clean(body.preferredContactMethod),
    interestedHome: clean(body.interestedHome),
    interestedHomeSlug: clean(body.interestedHomeSlug),
    landStatus: clean(body.landStatus),
    city: clean(body.city),
    county: clean(body.county),
    financingInterest: clean(body.financingInterest),
    deliverySetupHelp: clean(body.deliverySetupHelp),
    message: clean(body.message),
    smsContactConsent: body.smsContactConsent === true,
    smsMarketingConsent: body.smsMarketingConsent === true,
    consentTextContact,
    consentTextMarketing,
    sourcePage: clean(body.sourcePage),
    sourceUrl: clean(body.sourceUrl),
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? clean(body.userAgent)
  };
}

function validateLead(payload: LeadPayload, body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!payload.firstName) errors.push("First name is required.");
  if (!payload.lastName) errors.push("Last name is required.");
  if (!payload.phone && !payload.email) errors.push("Phone or email is required.");
  if (payload.email && !isEmail(payload.email)) errors.push("A valid email address is required.");
  if (!payload.smsContactConsent) errors.push("Contact consent is required.");

  const honeypot = clean(body.companyWebsite) || clean(body.website) || clean(body.url);
  if (honeypot) errors.push("Spam submission rejected.");

  const combined = [payload.firstName, payload.lastName, payload.phone, payload.email, payload.city, payload.county, payload.message].join("").replace(/\W/g, "");
  if (combined.length < 4) errors.push("Submission appears empty.");

  return errors;
}

function formatValue(value: string | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value || "Not provided";
}

function buildEmail(payload: LeadPayload) {
  const subjectHome = payload.interestedHome || payload.interestedHomeSlug;
  const subject = subjectHome ? `New Easy HomeSource Quote Request - ${subjectHome}` : "New Easy HomeSource Quote Request";
  const fields: Array<[string, string | boolean]> = [
    ["First name", payload.firstName],
    ["Last name", payload.lastName],
    ["Phone", payload.phone],
    ["Email", payload.email],
    ["Preferred contact method", payload.preferredContactMethod],
    ["Interested home/model", payload.interestedHome],
    ["Interested home slug", payload.interestedHomeSlug],
    ["Land status", payload.landStatus],
    ["City", payload.city],
    ["County", payload.county],
    ["Financing interest", payload.financingInterest],
    ["Delivery/setup help", payload.deliverySetupHelp],
    ["Notes", payload.message],
    ["Contact consent checked", payload.smsContactConsent],
    ["Marketing consent checked", payload.smsMarketingConsent],
    ["Contact consent language", payload.consentTextContact],
    ["Marketing consent language", payload.consentTextMarketing],
    ["Submitted page/source", payload.sourcePage],
    ["Source URL", payload.sourceUrl],
    ["Timestamp", payload.submittedAt],
    ["User agent", payload.userAgent]
  ];
  const text = fields.map(([label, value]) => `${label}: ${formatValue(value)}`).join("\n");
  const html = `<h1>New Easy HomeSource Quote Request</h1><table>${fields.map(([label, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(formatValue(value))}</td></tr>`).join("")}</table>`;
  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

async function sendLeadEmail(payload: LeadPayload) {
  const provider = process.env.EHS_LEAD_EMAIL_PROVIDER?.toLowerCase() || "resend";
  const to = process.env.EHS_LEAD_EMAIL_TO;
  const from = process.env.EHS_LEAD_EMAIL_FROM;
  const replyTo = process.env.EHS_LEAD_EMAIL_REPLY_TO || payload.email || undefined;

  if (provider !== "resend") throw new Error(`Unsupported lead email provider: ${provider}`);
  if (!process.env.RESEND_API_KEY || !to || !from) throw new Error("Lead email is not configured. Set RESEND_API_KEY, EHS_LEAD_EMAIL_TO, and EHS_LEAD_EMAIL_FROM.");

  const email = buildEmail(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((item) => item.trim()).filter(Boolean), reply_to: replyTo, subject: email.subject, text: email.text, html: email.html })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lead email provider failed with ${response.status}: ${errorText}`);
  }
}

// TODO: Add a GHL lead adapter here after routing and credentials are approved. Keep this normalized payload shape for that integration.
async function routeLead(payload: LeadPayload) {
  await sendLeadEmail(payload);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid quote request payload." }, { status: 400 });
  }

  const payload = normalizeLead(body, request);
  const errors = validateLead(payload, body);
  if (errors.length > 0) return NextResponse.json({ ok: false, message: "Missing or invalid quote request fields.", errors }, { status: 400 });

  try {
    await routeLead(payload);
    return NextResponse.json({ ok: true, message: "Thanks — your request has been received." });
  } catch (error) {
    console.error("Easy HomeSource quote/contact request delivery failed:", error, payload);
    return NextResponse.json({ ok: false, message: "Quote request delivery failed. Please call or text Easy HomeSource directly." }, { status: 502 });
  }
}
