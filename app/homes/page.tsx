import { HomesBrowser } from "@/components/HomesBrowser";
import { LeadForm } from "@/components/LeadForm";
import { homes } from "@/data/homes";

export default function HomesPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-black text-clay">Homes catalog</p>
        <h1 className="mt-2 text-4xl font-black text-forest">Available manufactured homes in Florida</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-forest/75">Browse homes carried by Easy HomeSource in Brooksville. Pricing, status, options, freight, setup, taxes, site work, and permitting can vary, so request current details before making plans.</p>
        <HomesBrowser homes={homes} />
        <div className="mt-12"><LeadForm cta="Start Quote" /></div>
      </div>
    </main>
  );
}
