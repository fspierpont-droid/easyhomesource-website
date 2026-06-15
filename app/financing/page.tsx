import { ButtonLink } from "@/components/ButtonLink";
import { LeadForm } from "@/components/LeadForm";

export default function FinancingPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1fr]">
        <section>
          <p className="font-black text-clay">Financing guidance</p>
          <h1 className="mt-2 text-4xl font-black text-forest">Get help preparing for manufactured home financing.</h1>
          <p className="mt-4 text-lg leading-8 text-forest/75">Easy HomeSource helps Florida buyers understand budget, lender conversations, home selections, land considerations, and the next steps that can affect delivery and move-in timing.</p>
          <div className="mt-8 grid gap-4">
            {["Review your goals, target payment, land plans, and preferred timeline.", "Discuss manufactured-home financing resources and common documentation needs.", "Understand how options, site work, freight, setup, taxes, and permits can affect the total project."].map((item) => <div key={item} className="rounded-2xl bg-sand p-5 font-semibold leading-7 text-forest">{item}</div>)}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/contact" variant="secondary">Get Pre-Qualified</ButtonLink></div>
        </section>
        <LeadForm cta="Get Pre-Qualified" />
      </div>
    </main>
  );
}
