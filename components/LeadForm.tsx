"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { homes } from "@/data/homes";
import { siteInfo } from "@/data/site";

const requiredConsent = "I agree to be contacted by Easy HomeSource by phone, text, or email about my home inquiry. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out.";
const marketingConsent = "I agree to receive occasional promotional messages from Easy HomeSource about homes, pricing, and offers.";

type LeadFormProps = { interestedHome?: string; interestedHomeSlug?: string; cta?: string; sourcePage?: string };
type FormErrors = Partial<Record<"firstName" | "lastName" | "contact" | "email" | "smsContactConsent", string>>;

function cleanPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LeadForm({ interestedHome = "", interestedHomeSlug = "", cta = "Request Info", sourcePage = "Website lead form" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "submitting">("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [phone, setPhone] = useState("");
  const matchedHomeSlug = useMemo(() => homes.find((home) => home.name === interestedHome || home.displayName === interestedHome)?.slug ?? interestedHomeSlug, [interestedHome, interestedHomeSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: FormErrors = {};
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const phoneValue = cleanPhone(String(formData.get("phone") ?? ""));
    const email = String(formData.get("email") ?? "").trim();

    if (!firstName) nextErrors.firstName = "First name is required.";
    if (!lastName) nextErrors.lastName = "Last name is required.";
    if (!phoneValue && !email) nextErrors.contact = "Please provide a phone number or email address.";
    if (email && !isValidEmail(email)) nextErrors.email = "Please enter a valid email address.";
    if (formData.get("smsContactConsent") !== "on") nextErrors.smsContactConsent = "Please check the required contact consent box before submitting.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      firstName,
      lastName,
      phone: phoneValue,
      email,
      preferredContactMethod: String(formData.get("preferredContactMethod") ?? ""),
      interestedHome: String(formData.get("interestedHome") ?? ""),
      interestedHomeSlug: matchedHomeSlug,
      landStatus: String(formData.get("landStatus") ?? ""),
      city: String(formData.get("city") ?? "").trim(),
      county: String(formData.get("county") ?? "").trim(),
      financingInterest: String(formData.get("financingInterest") ?? ""),
      deliverySetupHelp: String(formData.get("deliverySetupHelp") ?? ""),
      message: String(formData.get("message") ?? "").trim(),
      smsContactConsent: true,
      smsMarketingConsent: formData.get("smsMarketingConsent") === "on",
      consentTextContact: requiredConsent,
      consentTextMarketing: marketingConsent,
      sourcePage,
      sourceUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    setStatus("submitting");
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Lead submission failed");
      setStatus("success");
      form.reset();
      setPhone("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <div className="rounded-[2rem] border border-ehsBlue/20 bg-white p-6 shadow-xl shadow-ehsBlack/5 sm:p-8"><p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Request received</p><h2 className="mt-2 text-3xl font-black text-ehsBlack">Thanks — your request has been received.</h2><p className="mt-4 text-lg leading-8 text-ehsBlack/75">An Easy HomeSource team member will contact you soon about pricing, availability, delivery, setup, financing options, and next steps.</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border border-borderGray bg-white p-5 shadow-xl shadow-ehsBlack/5 sm:p-8">
      <div className="border-b border-borderGray pb-5">
        <p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Easy HomeSource</p>
        <h2 className="mt-1 text-3xl font-black text-ehsBlack">{cta}</h2>
        <p className="mt-2 text-sm leading-6 text-ehsBlack/70">Tell us what you are looking for and our Brooksville team will follow up about home availability, delivery and setup, financing options, and next steps.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required error={errors.firstName} />
        <Field label="Last name" name="lastName" required error={errors.lastName} />
        <Field label="Phone number" name="phone" type="tel" value={phone} onChange={(value) => setPhone(cleanPhone(value))} error={errors.contact} />
        <Field label="Email address" name="email" type="email" error={errors.email ?? errors.contact} />
        <Select label="Preferred contact method" name="preferredContactMethod" options={["Call", "Text", "Email"]} />
        <Select label="Interested home/model" name="interestedHome" defaultValue={interestedHome} options={homes.map((home) => home.displayName ?? home.name)} placeholder="Not sure yet" />
        <Select label="Land status" name="landStatus" options={["I own land", "I am buying land", "I need help finding land", "Not sure yet"]} />
        <Select label="Financing interest" name="financingInterest" options={["I need financing", "I already have financing", "Cash buyer", "Not sure yet"]} />
        <Field label="City" name="city" />
        <Field label="County" name="county" />
        <Select label="Delivery/setup help needed" name="deliverySetupHelp" options={["Yes", "No", "Not sure"]} />
      </div>
      <label className="mt-4 block text-sm font-black text-ehsBlack">Message/notes<textarea name="message" rows={4} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" placeholder="Example: I own land near Brooksville and want a 3-bedroom home." /></label>
      <Consent name="smsContactConsent" text={requiredConsent} required error={errors.smsContactConsent} />
      <Consent name="smsMarketingConsent" text={marketingConsent} />
      <p className="mt-4 text-xs font-semibold leading-6 text-ehsBlack/65">By submitting, you confirm the required consent box above was checked voluntarily. See our <Link className="font-black text-ehsBlue underline" href="/privacy">Privacy Policy</Link> and <Link className="font-black text-ehsBlue underline" href="/terms">Terms</Link>. Contact us at <a className="font-black text-ehsBlue underline" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a> or <a className="font-black text-ehsBlue underline" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a>.</p>
      <button disabled={status === "submitting"} className="mt-5 w-full rounded-full bg-ehsBlue px-6 py-4 font-black text-white transition hover:bg-ehsBlue/90 disabled:cursor-wait disabled:opacity-70" type="submit">{status === "submitting" ? "Sending..." : cta}</button>
      {status === "error" && <p className="mt-4 rounded-2xl bg-ehsSoftBlue p-3 text-sm font-semibold text-ehsBlack">Something went wrong. Please call/text {siteInfo.phoneDisplay} or try again in a moment.</p>}
    </form>
  );
}

function Field({ label, name, type = "text", required = false, error, value, onChange }: { label: string; name: string; type?: string; required?: boolean; error?: string; value?: string; onChange?: (value: string) => void }) {
  return <label className="block text-sm font-black text-ehsBlack">{label}{required && <span className="text-ehsBlue"> *</span>}<input required={required} name={name} type={type} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" />{error && <span className="mt-1 block text-xs font-bold text-red-700">{error}</span>}</label>;
}
function Select({ label, name, options, defaultValue = "", placeholder = "Select one" }: { label: string; name: string; options: string[]; defaultValue?: string; placeholder?: string }) {
  return <label className="block text-sm font-black text-ehsBlack">{label}<select name={name} defaultValue={defaultValue} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10"><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
function Consent({ name, text, required = false, error }: { name: string; text: string; required?: boolean; error?: string }) {
  return <label className="mt-4 flex gap-3 rounded-2xl border border-borderGray bg-ehsSoftBlue/60 p-4 text-sm font-semibold leading-6 text-ehsBlack/80"><input name={name} type="checkbox" required={required} className="mt-1 h-4 w-4 shrink-0 accent-ehsBlue" /> <span>{text}{required && <strong className="text-ehsBlue"> Required.</strong>}{error && <span className="mt-1 block text-xs font-bold text-red-700">{error}</span>}</span></label>;
}
