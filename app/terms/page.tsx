import Link from "next/link";
import { siteInfo } from "@/data/site";

export const metadata = { title: "Terms & Conditions", description: "Easy HomeSource terms and SMS messaging conditions." };

export default function TermsPage() {
  return (
    <main className="px-4 py-12">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-borderGray bg-white p-8">
        <p className="font-black text-ehsBlue">Terms &amp; Conditions</p>
        <h1 className="mt-2 text-4xl font-black text-ehsBlack">Easy HomeSource Terms &amp; Conditions</h1>
        <div className="mt-6 space-y-6 leading-8 text-ehsBlack/75">
          <p>Easy HomeSource provides manufactured home information, pricing guidance, financing guidance, delivery and setup coordination, and related customer support for buyers interested in manufactured homes.</p>
          <p>Home availability, pricing, financing, delivery, setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.</p>

          <section>
            <h2 className="text-2xl font-black text-ehsBlack">SMS Messaging Terms</h2>
            <p className="mt-3">By checking an SMS consent box and submitting a form, you agree to receive text messages from Easy HomeSource at the phone number you provide. SMS consent is collected only when a user voluntarily checks one or both consent boxes before submitting the form.</p>
            <p className="mt-3">Message types may include informational messages, including responses to inquiries, appointment reminders, account updates, customer service communications, service updates, quotes, financing, delivery, setup, and project updates. Marketing and promotional messages may include inventory updates, pricing updates, promotions, and special offers if separately consented.</p>
            <p className="mt-3">Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for assistance or contact us at <a className="font-black text-ehsBlack underline" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a> or <a className="font-black text-ehsBlack underline" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a>.</p>
            <p className="mt-3">Consent is not a condition of purchase. We do not sell or share your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-ehsBlack">Contact</h2>
            <ul className="mt-3 list-disc pl-6">
              <li>By email: <a className="font-black text-ehsBlack underline" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></li>
              <li>By phone: <a className="font-black text-ehsBlack underline" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a></li>
              <li>Address: {siteInfo.address}</li>
            </ul>
          </section>

          <p>View our Privacy Policy: <Link className="font-black text-ehsBlack underline" href="/privacy">{siteInfo.privacyUrl}</Link></p>
        </div>
      </section>
    </main>
  );
}