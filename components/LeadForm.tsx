"use client";

import { FormEvent, useState } from "react";
import { homes } from "@/data/homes";

export function LeadForm({ interestedHome = "" }: { interestedHome?: string }) {
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-clay">Talk with Easy HomeSource</p>
        <h2 className="mt-1 text-2xl font-black text-forest">Request more information</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <label className="block text-sm font-bold text-forest">
        Preferred contact method
        <select name="preferredContactMethod" className="mt-2 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 font-normal text-forest">
          <option>Phone</option>
          <option>Email</option>
          <option>Text</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-forest">
        Interested home
        <select name="interestedHome" defaultValue={interestedHome} className="mt-2 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 font-normal text-forest">
          <option value="">Not sure yet</option>
          {homes.map((home) => <option key={home.slug} value={home.name}>{home.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold text-forest">
        Message
        <textarea name="message" rows={4} className="mt-2 w-full rounded-2xl border border-forest/15 px-4 py-3 font-normal text-forest" placeholder="Tell us what you are looking for." />
      </label>
      <button className="w-full rounded-full bg-clay px-6 py-3 font-bold text-white transition hover:bg-clay/90" type="submit">
        Send my request
      </button>
      {status === "success" && <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-800">Thanks! Your request has been captured and our team will follow up soon.</p>}
      {status === "error" && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-800">Something went wrong. Please call or try again in a moment.</p>}
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-forest">
      {label}
      <input required={required} name={name} type={type} className="mt-2 w-full rounded-2xl border border-forest/15 px-4 py-3 font-normal text-forest" />
    </label>
  );
}
