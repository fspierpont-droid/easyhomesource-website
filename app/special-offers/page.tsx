import { HomeCard } from "@/components/HomeCard";
import { homes } from "@/data/homes";
export const metadata = { title: "Special Offers", description: "Discover current special offers and featured pricing on manufactured homes in Brooksville, Florida." };
export default function SpecialOffersPage() {
  const offers = homes.filter((h) => h.isSpecialOffer);
  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Special Offers</p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-black text-ehsBlack">Manufactured home offers</h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-ehsBlack/75">
          Offers, availability, pricing, financing, delivery and setup, taxes, fees, permits, site conditions, lender approval, and final costs are subject to change and final quote.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {offers.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      </div>
    </main>
  );
}
