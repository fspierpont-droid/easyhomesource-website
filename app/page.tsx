import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard } from "@/components/HomeCard";
import { LeadForm } from "@/components/LeadForm";
import { getFeaturedHomes } from "@/data/homes";

export default function HomePage() {
  const featuredHomes = getFeaturedHomes();

  return (
    <main>
      <section className="bg-sand px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-bold uppercase tracking-wide text-clay">Manufactured homes in Brooksville, Florida</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-forest sm:text-6xl">A Clearer Path to Homeownership</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-forest/75">Easy HomeSource helps Florida buyers find affordable manufactured homes with clear pricing, financing guidance, and support from quote to move-in.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/homes">View Available Homes</ButtonLink>
              <ButtonLink href="/financing" variant="secondary">Get Pre-Qualified</ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-5 shadow-xl">
            <div className="flex h-72 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-forest to-clay p-8 text-center text-xl font-black text-white">Featured manufactured home image placeholder</div>
          </div>
        </div>
      </section>
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <div><p className="font-bold text-clay">Featured homes</p><h2 className="text-3xl font-black text-forest">Available options to explore</h2></div>
            <ButtonLink href="/homes" variant="secondary">See all homes</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">{featuredHomes.map((home) => <HomeCard key={home.slug} home={home} />)}</div>
        </div>
      </section>
      <section className="bg-sand px-4 py-14"><div className="mx-auto max-w-3xl"><LeadForm /></div></section>
    </main>
  );
}
