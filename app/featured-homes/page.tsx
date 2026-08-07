import { HomeCard } from "@/components/HomeCard";
import { getFeaturedHomes } from "@/data/homes";
export const metadata = { title: "Featured Homes", description: "Browse featured manufactured homes from Easy HomeSource in Brooksville, Florida." };
export default function FeaturedHomesPage() {
  const featured = getFeaturedHomes();
  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Featured Homes</p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-black text-ehsBlack">Featured manufactured homes</h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-ehsBlack/75">
          Compare selected homes and request current pricing, delivery and setup, and financing-option details.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {featured.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      </div>
    </main>
  );
}
