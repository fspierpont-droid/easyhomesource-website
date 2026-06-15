import { HomeCard } from "@/components/HomeCard";
import { LeadForm } from "@/components/LeadForm";
import { homes } from "@/data/homes";

export default function HomesPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-bold text-clay">Homes catalog</p>
        <h1 className="mt-2 text-4xl font-black text-forest">Available manufactured homes</h1>
        <p className="mt-4 max-w-3xl text-forest/75">Browse mock inventory while we prepare live listings. Contact Easy HomeSource for current availability, delivery details, and financing guidance.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">{homes.map((home) => <HomeCard key={home.slug} home={home} />)}</div>
        <div className="mt-12"><LeadForm /></div>
      </div>
    </main>
  );
}
