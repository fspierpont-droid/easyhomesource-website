import { ButtonLink } from "@/components/ButtonLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financing Options",
  description: "Learn about the clear, stress-free financing options for manufactured and mobile homes in Brooksville, FL at Easy HomeSource.",
};

export default function FinancingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-ehsDeepBlue sm:text-5xl">Financing Options</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ehsBlack/70">
          We believe the path to homeownership should be clear and stress-free. Our local Brooksville team works with trusted lenders to find the right financing package for your family.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-ehsBlue/10 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-ehsDeepBlue">Home-Only Financing</h2>
          <p className="mt-4 leading-relaxed text-ehsBlack/70">
            If you already own land or are planning to place your new home in a leased-lot community, home-only (chattel) loans are designed just for you. They typically offer a streamlined approval process so you can move in faster.
          </p>
        </div>

        <div className="rounded-2xl border border-ehsBlue/10 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-ehsDeepBlue">Land & Home Packages</h2>
          <p className="mt-4 leading-relaxed text-ehsBlack/70">
            Looking to purchase land and a home at the same time? We can help coordinate construction-to-permanent loans that bundle the cost of your land, the home, delivery, setup, and site improvements into one single monthly payment.
          </p>
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-ehsSoftBlue/20 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-black text-ehsDeepBlue">Ready to explore your options?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ehsBlack/70">
          Every financial situation is unique. Reach out to our team today, and we'll guide you through the process, answer your questions, and connect you with our trusted lending partners.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <ButtonLink href="/get-quote" size="lg" className="bg-ehsLightBlue text-white hover:bg-ehsBlue">Contact Our Team</ButtonLink>
          <ButtonLink href="/homes" size="lg" variant="secondary" className="bg-white">Browse Homes First</ButtonLink>
        </div>
      </div>
    </main>
  );
}
