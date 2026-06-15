import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard } from "@/components/HomeCard";
import { LeadForm } from "@/components/LeadForm";
import { getFeaturedHomes } from "@/data/homes";

const reasons = [
  "Straightforward home information and clear starting prices.",
  "Guidance on financing conversations before you choose a model.",
  "Help coordinating delivery, setup, permits, and move-in steps."
];

export default function HomePage() {
  const featuredHomes = getFeaturedHomes();

  return (
    <main>
      <section className="relative overflow-hidden bg-sand px-4 py-16 sm:py-24">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-clay/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative">
            <p className="font-black uppercase tracking-wide text-clay">Manufactured homes in Brooksville, Florida</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-forest sm:text-6xl">Affordable Florida manufactured homes, without the guesswork.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-forest/75">Easy HomeSource helps buyers find affordable manufactured homes with clear pricing, financing guidance, and support through delivery, setup, permitting, and move-in.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/homes">View Available Homes</ButtonLink>
              <ButtonLink href="/financing" variant="secondary">Get Pre-Qualified</ButtonLink>
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl shadow-forest/10">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-forest via-forest to-clay p-6 text-white">
              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-wide text-white/70">Brooksville dealership support</p>
                <h2 className="mt-16 text-3xl font-black">Homes, financing guidance, delivery, setup, and permits in one clear process.</h2>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-black">
                <span className="rounded-2xl bg-white/15 p-3">Clear pricing</span>
                <span className="rounded-2xl bg-white/15 p-3">Florida delivery</span>
                <span className="rounded-2xl bg-white/15 p-3">Move-in help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-black text-clay">Featured homes</p><h2 className="text-3xl font-black text-forest">Popular homes for Florida buyers</h2></div>
            <ButtonLink href="/homes" variant="secondary">View Available Homes</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">{featuredHomes.map((home) => <HomeCard key={home.id} home={home} />)}</div>
        </div>
      </section>

      <section className="bg-forest px-4 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1"><p className="font-black text-clay">Why choose Easy HomeSource</p><h2 className="mt-2 text-3xl font-black">A simpler way to shop for a manufactured home.</h2></div>
          <div className="grid gap-4 lg:col-span-2 sm:grid-cols-3">{reasons.map((reason) => <div key={reason} className="rounded-3xl bg-white/10 p-5 font-semibold leading-7 text-white/85">{reason}</div>)}</div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <InfoBlock title="Financing guidance" text="Start with budget, lender expectations, down-payment questions, and the land or community details that may affect your path forward." cta="Get Pre-Qualified" href="/financing" />
          <InfoBlock title="Delivery, setup, and permits" text="We help buyers understand the steps after selecting a home, including freight, site work, setup, inspections, and permitting timelines." cta="Schedule a Tour" href="/contact" />
        </div>
      </section>

      <section className="bg-sand px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-black text-clay">Ready to browse?</p>
            <h2 className="mt-2 text-4xl font-black text-forest">Compare homes by price, size, beds, baths, and availability.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/contact" variant="secondary">Request Info</ButtonLink></div>
          </div>
          <LeadForm cta="Request Info" />
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return <div className="rounded-[2rem] border border-forest/10 bg-white p-8 shadow-sm"><h2 className="text-3xl font-black text-forest">{title}</h2><p className="mt-4 leading-8 text-forest/70">{text}</p><div className="mt-6"><ButtonLink href={href} variant="secondary">{cta}</ButtonLink></div></div>;
}
