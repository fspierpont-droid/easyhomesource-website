import { ButtonLink } from "@/components/ButtonLink";
import { LeadForm } from "@/components/LeadForm";

export default function FinancingPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1fr]">
        <section>
          <p className="font-bold text-clay">Financing guidance</p>
          <h1 className="mt-2 text-4xl font-black text-forest">Get help understanding your options</h1>
          <p className="mt-4 text-lg leading-8 text-forest/75">Easy HomeSource helps buyers prepare for lender conversations by explaining budget, home selections, land considerations, and next steps in plain language.</p>
          <div className="mt-8 grid gap-4">
            {['Review your goals and target monthly payment.', 'Connect with manufactured-home financing resources.', 'Understand what details may affect approvals and move-in timing.'].map((item) => <div key={item} className="rounded-2xl bg-sand p-5 font-semibold text-forest">{item}</div>)}
          </div>
          <div className="mt-8"><ButtonLink href="/homes">View Available Homes</ButtonLink></div>
        </section>
        <LeadForm />
      </div>
    </main>
  );
}
