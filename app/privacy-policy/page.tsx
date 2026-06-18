import Link from "next/link";
import { siteInfo } from "@/data/site";

export const metadata = { title: "Privacy Policy", description: "Easy HomeSource privacy policy and SMS data practices." };

export default function PrivacyPolicyPage() {
  return (
    <main className="px-4 py-12">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-borderGray bg-white p-8">
        <p className="font-black text-ehsBlue">Privacy Policy</p>
        <h1 className="mt-2 text-4xl font-black text-ehsBlack">Easy HomeSource Privacy Policy</h1>
        <div className="mt-6 space-y-6 leading-8 text-ehsBlack/75">
          <p>Easy HomeSource collects information you voluntarily provide through website forms, phone calls, text messages, email, and related customer communications. This may include your name, phone number, email address, interested home, land ownership status, financing interest, purchase timeline, and message details.</p>
          <p>We use this information to respond to inquiries, provide home availability and pricing guidance, schedule appointments, discuss financing, delivery, setup, permitting, and provide customer service updates.</p>

          <section>
            <h2 className="text-2xl font-black text-ehsBlack">SMS Consent and Privacy</h2>
            <p className="mt-3">SMS consent is collected only when a user voluntarily checks one or both consent boxes before submitting a form. Message types may include informational messages, including responses to inquiries, appointment reminders, account updates, customer service communications, service updates, quotes, financing, delivery, setup, and project updates. Marketing and promotional messages may include inventory updates, pricing updates, promotions, and special offers if separately consented.</p>
            <p className="mt-3">Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for assistance or contact us at <a className="font-black text-ehsBlack underline" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a> or <a className="font-black text-ehsBlack underline" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a>.</p>
            <p className="mt-3">Consent is not a condition of purchase. We do not sell or share your information. We do not sell, rent, or share SMS opt-in consent or phone numbers for third-party marketing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-ehsBlack">Contact</h2>
            <ul className="mt-3 list-disc pl-6">
              <li>Email: <a className="font-black text-ehsBlack underline" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></li>
              <li>Phone: <a className="font-black text-ehsBlack underline" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a></li>
              <li>Address: {siteInfo.address}</li>
            </ul>
          </section>

          <p>View our Terms &amp; Conditions: <Link className="font-black text-ehsBlack underline" href="/terms">{siteInfo.termsUrl}</Link></p>
        </div>
      </section>
    </main>
  );
}