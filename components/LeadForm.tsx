"use client";

import { FormEvent, useState } from "react";
import { homes } from "@/data/homes";

export function LeadForm({ interestedHome = "", cta = "Request Info" }: { interestedHome?: string; cta?: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const webhookUrl = process.env.NEXT_PUBLIC_GHL_WEBHOOK_URL;

    if (!webhookUrl) {
      setStatus("success");
      form.reset();
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Lead webhook failed");
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
        <p className="mt-2 text-sm leading-6 text-ehsBlack/70">Tell us what you are looking for and our Brooksville team will follow up with home availability, financing next steps, and delivery details.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select label="Preferred contact" name="preferredContactMethod" options={["Phone", "Text", "Email"]} />
        <label className="block text-sm font-black text-ehsBlack">
          Interested home
          <select name="interestedHome" defaultValue={interestedHome} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10">
            <option value="">Not sure yet</option>
            {homes.map((home) => <option key={home.id} value={home.name}>{home.name}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm font-black text-ehsBlack">
        Message
        <textarea name="message" rows={4} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" placeholder="Example: I own land near Brooksville and want a 3-bedroom home." />
      </label>
      <button className="mt-5 w-full rounded-full bg-ehsBlue px-6 py-4 font-black text-white transition hover:bg-ehsBlue/90" type="submit">
        {cta}
      </button>
      {status === "success" && <p className="mt-4 rounded-2xl bg-ehsSoftBlue p-3 text-sm font-semibold text-ehsBlack">Thanks! Your request has been captured and our team will follow up soon.</p>}
      {status === "error" && <p className="mt-4 rounded-2xl bg-ehsSoftBlue p-3 text-sm font-semibold text-ehsBlack">Something went wrong. Please call or try again in a moment.</p>}
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-black text-ehsBlack">
      {label}
      <input required={required} name={name} type={type} className="mt-2 w-full rounded-2xl border border-borderGray px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10" />
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block text-sm font-black text-ehsBlack">
      {label}
      <select name={name} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-normal text-ehsBlack outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsBlue/10">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
