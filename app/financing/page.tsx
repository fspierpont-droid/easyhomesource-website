import { ButtonLink } from "@/components/ButtonLink";
import { LeadForm } from "@/components/LeadForm";

const financingSections = [
  ["Getting pre-qualified", "Start with a practical conversation about budget, timing, credit, income, land plans, and the type of manufactured home you want. Pre-qualification can help you understand what information a lender may request before you choose a specific home."],
  ["Manufactured home financing considerations", "Manufactured home loans can vary based on whether the home is placed on owned land, leased land, or purchased with land. Home type, age, installation details, insurance, title work, and lender program requirements may all affect the path forward."],
  ["Land-home package questions", "If you are buying land with the home or already own property, ask early about zoning, access, utilities, well and septic needs, surveys, flood considerations, setbacks, and whether the selected home can be installed on that site."],
  ["Down payment and documentation", "Be prepared to discuss potential down payment funds and common documentation such as identification, income information, employment history, bank statements, land details, and any lender-specific forms."],
  ["Total project cost factors", "The home price is only one part of the project. Site work, delivery and setup, taxes, permits, utility connections, skirting, steps, options, inspections, and local requirements can affect the final amount needed to move in."]
];

export default function FinancingPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1fr]">
        <section>
          <p className="font-black text-ehsBlue">Financing guidance</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack">Prepare for manufactured home financing with clearer next steps.</h1>
          <p className="mt-4 text-lg leading-8 text-ehsBlack/75">Easy HomeSource helps Florida buyers get ready for lender conversations without promising approval, rates, payments, or specific loan terms. Our goal is to help you ask better questions and understand the real costs that can affect your move-in plan.</p>
          <div className="mt-8 grid gap-4">
            {financingSections.map(([title, text]) => <div key={title} className="rounded-2xl bg-ehsSoftBlue p-5 leading-7 text-ehsBlack"><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-ehsBlack/75">{text}</p></div>)}
          </div>
          <p className="mt-6 rounded-2xl border border-borderGray bg-white p-4 text-sm font-semibold leading-6 text-ehsBlack/70">Financing information on this website is for guidance only and is not an approval, guarantee, credit decision, or commitment to lend. Financing availability, qualification requirements, rates, payments, down payment amounts, and loan terms are determined by lenders and may vary by buyer, property, home, and program.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/get-quote" variant="secondary">Ask About Pre-Qualification</ButtonLink></div>
        </section>
        <LeadForm cta="Ask About Financing" />
      </div>
    </main>
  );
}
