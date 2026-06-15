"use client";

import { FormEvent, useState } from "react";
import { homes } from "@/data/homes";

const informationalConsent = "I agree to receive informational calls and text messages from Easy HomeSource about my inquiry, quotes, appointments, financing, delivery, setup, and project updates. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help.";
const marketingConsent = "I agree to receive marketing calls and text messages from Easy HomeSource about homes, promotions, events, and homeownership opportunities. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.";

type LeadFormProps = { interestedHome?: string; interestedHomeSlug?: string; cta?: string; sourcePage?: string };

export function LeadForm({ interestedHome = "", interestedHomeSlug = "", cta = "Request Info", sourcePage = "Website lead form" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "submitting">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      interestedHome: String(formData.get("interestedHome") ?? ""),
      interestedHomeSlug,
      sourcePage,
      sourceUrl: window.location.href,
      ownsLand: String(formData.get("ownsLand") ?? ""),
      preferredContactMethod: String(formData.get("preferredContactMethod") ?? ""),
      timeline: String(formData.get("timeline") ?? ""),
      financingInterest: String(formData.get("financingInterest") ?? ""),
      message: String(formData.get("message") ?? ""),
      smsInformationalConsent: formData.get("smsInformationalConsent") === "on",
      smsMarketingConsent: formData.get("smsMarketingConsent") === "on",
      consentTextInformational: informationalConsent,
      consentTextMarketing: marketingConsent,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    setStatus("submitting");
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Lead submission failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-borderGray bg-white p-5 shadow-xl shadow-ehsBlack/5 sm:p-8">
      <div className="border-b border-borderGray pb-5">
        <p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Easy HomeSource</p>
        <h2 className="mt-1 text-3xl font-black text-ehsBlack">{cta}</h2>
        <p className="mt-2 text-sm leading-6 text-ehsBlack/70">Tell us what you are looking for and our Brooksville team will follow up with home availability, financing options, delivery, setup, and permitting details.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="First Name" name="firstName" required />
        <Field label="Last Name" name="lastName" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required />
        <Select label="Do You Own Land?" name="ownsLand" options={["Yes", "No", "Not Sure"]} />
        <Select label="Preferred Contact Method" name="preferredContactMethod" options={["Call", "Text", "Email"]} />
        <Select label="Timeline to Purchase" name="timeline" options={["ASAP", "30-60 Days", "60-90 Days", "90+ Days", "Just Looking"]} />
        <Select label="Financing Interest" name="financingInterest" options={["Yes", "No", "Not Sure"]} />
      </div>
      <label className="mt-4 block text-sm font-black text-ehsBlack">
        Interested Home
        <select name="interestedHome" defaultValue={interestedHome} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10">
          <option value="">Not sure yet</option>
          {homes.map((home) => <option key={home.id} value={home.name}>{home.name}</option>)}
        </select>
      </label>
      <label className="mt-4 block text-sm font-black text-ehsBlack">
        Message
        <textarea name="message" rows={4} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" placeholder="Example: I own land near Brooksville and want a 3-bedroom home." />
      </label>
      <Consent name="smsInformationalConsent" text={informationalConsent} />
      <Consent name="smsMarketingConsent" text={marketingConsent} />
      <button disabled={status === "submitting"} className="mt-5 w-full rounded-full bg-ehsBlue px-6 py-4 font-black text-white transition hover:bg-ehsBlue/90 disabled:cursor-wait disabled:opacity-70" type="submit">
        {status === "submitting" ? "Sending..." : cta}
      </button>
      {status === "success" && <p className="mt-4 rounded-2xl bg-ehsSoftBlue p-3 text-sm font-semibold text-ehsBlack">Thanks! Your request has been captured and our team will follow up soon.</p>}
      {status === "error" && <p className="mt-4 rounded-2xl bg-ehsSoftBlue p-3 text-sm font-semibold text-ehsBlack">Something went wrong. Please call/text 352-558-8888 or try again in a moment.</p>}
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block text-sm font-black text-ehsBlack">{label}<input required={required} name={name} type={type} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" /></label>;
}
function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block text-sm font-black text-ehsBlack">{label}<select name={name} defaultValue="" className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10"><option value="" disabled>Select one</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
function Consent({ name, text }: { name: string; text: string }) {
  return <label className="mt-4 flex gap-3 rounded-2xl border border-borderGray bg-ehsSoftBlue/60 p-4 text-sm font-semibold leading-6 text-ehsBlack/80"><input name={name} type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-ehsBlue" /> <span>{text}</span></label>;
}
