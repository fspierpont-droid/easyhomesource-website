import { ButtonLink } from "@/components/ButtonLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery & Setup",
  description: "Understand the turnkey delivery, setup, and permitting process for manufactured homes with Easy HomeSource in Central Florida.",
};

export default function DeliverySetupPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-ehsDeepBlue sm:text-5xl">Delivery & Setup</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ehsBlack/70">
          Getting your home from our lot to your land requires expertise. With decades of local experience in Brooksville and Central Florida, we make the heavy lifting simple.
        </p>
      </div>

      <div className="mt-16 space-y-12">
        <section className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ehsLightBlue/10 text-2xl font-black text-ehsLightBlue">1</div>
          <div>
            <h2 className="text-2xl font-bold text-ehsDeepBlue">Site Preparation & Permitting</h2>
            <p className="mt-3 leading-relaxed text-ehsBlack/70">
              Before your home ever leaves our lot, the ground needs to be ready. We understand local Hernando County and Central Florida zoning laws. We&apos;ll help coordinate the necessary permits, land clearing, and foundation prep required for a safe, compliant installation.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ehsLightBlue/10 text-2xl font-black text-ehsLightBlue">2</div>
          <div>
            <h2 className="text-2xl font-bold text-ehsDeepBlue">Professional Delivery</h2>
            <p className="mt-3 leading-relaxed text-ehsBlack/70">
              Moving a manufactured home requires specialized logistics. Our trusted transport partners ensure your home is safely delivered to your site, navigating local routes and site access challenges with professional care.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ehsLightBlue/10 text-2xl font-black text-ehsLightBlue">3</div>
          <div>
            <h2 className="text-2xl font-bold text-ehsDeepBlue">Setup & Utility Hookups</h2>
            <p className="mt-3 leading-relaxed text-ehsBlack/70">
              Once on-site, the real work begins. We oversee the blocking, leveling, and anchoring of your home to its foundation. From there, we coordinate with licensed contractors to ensure your power, water, and septic/sewer systems are correctly connected and inspected.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-16 rounded-3xl bg-ehsSoftBlue/20 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-black text-ehsDeepBlue">Have questions about your property?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ehsBlack/70">
          Whether you have a flat, cleared lot ready to go or raw land that needs work, our team is here to evaluate your site and provide a clear plan.
        </p>
        <div className="mt-8">
          <ButtonLink href="/get-quote" size="lg" className="bg-ehsLightBlue text-white hover:bg-ehsBlue">Contact Us to Discuss Your Site</ButtonLink>
        </div>
      </div>
    </main>
  );
}
