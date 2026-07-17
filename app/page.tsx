import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard } from "@/components/HomeCard";
import { LeadForm } from "@/components/LeadForm";
import { VideoCard } from "@/components/VideoCard";
import { formatHomePrice, getFeaturedHomes, getHomeBySlug } from "@/data/homes";
import { videos } from "@/data/videos";

const proofPoints = [
  { label: "Tour homes today", value: "Brooksville lot" },
  { label: "Clear pricing path", value: "Quote before you commit" },
  { label: "Local guidance", value: "Delivery, setup, financing" }
];

const steps = [
  { title: "Browse real homes", text: "Start with homes you can tour on the Easy HomeSource lot or compare orderable floor plans online." },
  { title: "Plan the full package", text: "Review home pricing, land-and-home package options, financing questions, delivery, setup, permits, and site conditions before you commit." },
  { title: "Move forward with support", text: "Work with the Brooksville team through home selection, package planning, lender conversations, delivery coordination, and move-in steps." }
];

const reasons = [
  "Real display homes, public starting prices, and simple comparison tools.",
  "A one-stop path for home-only buyers, turnkey planning, land-and-home package questions, delivery, setup, and permits.",
  "Local Brooksville support instead of a generic online catalog experience."
];

export default function HomePage() {
  const featuredHomes = getFeaturedHomes();
  const homepageFeaturedHomes = featuredHomes.slice(0, 6);
  const displayHomeCount = featuredHomes.filter((home) => home.isOnDisplay).length;
  const tulip = getHomeBySlug("tulip");
  const dogwood = getHomeBySlug("dogwood");
  const bornToRun = getHomeBySlug("born-to-run");

  return (
    <main>
      <section className="relative overflow-hidden bg-ehsSoftBlue px-4 py-14 sm:py-20">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-ehsBlue/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative">
            <p className="font-black uppercase tracking-wide text-ehsBlue">Manufactured homes in Brooksville, Florida</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ehsBlack sm:text-6xl">Affordable Florida manufactured homes, without the guesswork.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ehsBlack/75">Easy HomeSource helps buyers compare homes, understand pricing, explore financing options, and get support through delivery, setup, permitting, and move-in.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/homes">View Available Homes</ButtonLink>
              <ButtonLink href="/get-quote" variant="secondary">Get Pricing</ButtonLink>
              <ButtonLink href="/financing" variant="secondary">Check Financing Options</ButtonLink>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-borderGray bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-black text-ehsBlue">{point.label}</p>
                  <p className="mt-1 font-black text-ehsBlack">{point.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl shadow-ehsBlack/10">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-ehsBlack via-ehsBlack to-ehsBlue p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase tracking-wide text-white/70">Homes you can tour today</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ehsBlack">Brooksville, FL</span>
              </div>
              <h2 className="mt-6 text-3xl font-black">Start with real homes, then build the right plan.</h2>
              <p className="mt-4 leading-7 text-white/80">Walk through homes on the lot, compare monthly-budget expectations, and talk through the real project pieces before making a decision.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/15 p-4"><p className="text-3xl font-black">{displayHomeCount}</p><p className="text-sm font-bold text-white/75">display homes</p></div>
                <div className="rounded-2xl bg-white/15 p-4"><p className="text-3xl font-black">{tulip ? formatHomePrice(tulip) : "$39,888"}</p><p className="text-sm font-bold text-white/75">featured special</p></div>
                <div className="rounded-2xl bg-white/15 p-4"><p className="text-3xl font-black">352</p><p className="text-sm font-bold text-white/75">local call/text</p></div>
              </div>
              <div className="mt-6 grid gap-3">
                {[tulip, dogwood, bornToRun].filter(Boolean).map((home) => (
                  <div key={home!.slug} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <div>
                      <p className="font-black">{home!.displayName ?? home!.name}</p>
                      <p className="text-sm font-semibold text-white/70">{home!.bedrooms} bed • {home!.bathrooms} bath • {home!.size}</p>
                    </div>
                    <p className="text-right font-black">{formatHomePrice(home!)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] bg-white p-8 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="font-black text-ehsBlue">Why Rent When You Can Own?</p><h2 className="mt-2 text-4xl font-black text-ehsBlack">Homeownership may be closer than you think.</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-ehsBlack/75">Start with affordable homes, then get help understanding financing, turnkey package planning, land-and-home options, delivery, setup, permitting, and the final quote before you make a decision.</p></div>
          <div className="flex flex-col gap-3"><ButtonLink href="/homes">See Homes You Can Own</ButtonLink><ButtonLink href="/get-quote" variant="secondary">Talk to a Home Consultant</ButtonLink></div>
        </div>
      </section>

      <section className="bg-ehsSoftBlue px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[2rem] bg-gradient-to-br from-ehsBlack to-ehsBlue p-8 text-white"><p className="text-sm font-black uppercase tracking-wide text-white/70">Featured Affordable Home</p><h2 className="mt-2 text-4xl font-black">Starting at {tulip ? formatHomePrice(tulip) : "Call for current pricing"}</h2><h3 className="mt-3 text-2xl font-black">The Tulip</h3><p className="mt-4 leading-8 text-white/80">A practical, budget-friendly starting point for buyers who want a real path toward ownership instead of another year of rent payments.</p></div>
          <div><div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href="/get-quote?home=tulip">Get Pricing</ButtonLink><ButtonLink href="/get-quote?home=tulip" variant="secondary">Schedule a Tour</ButtonLink><ButtonLink href="tel:+13525588888" variant="secondary">Call/Text 352-558-8888</ButtonLink></div><p className="mt-5 rounded-2xl border border-borderGray bg-white p-4 text-sm font-semibold leading-6 text-ehsBlack/70">Home availability, pricing, financing, delivery and setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.</p></div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-black text-ehsBlue">Featured homes</p><h2 className="text-3xl font-black text-ehsBlack">Popular homes for Florida buyers</h2></div>
            <ButtonLink href="/homes" variant="secondary">View Available Homes</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">{homepageFeaturedHomes.map((home) => <HomeCard key={home.id} home={home} />)}</div>
        </div>
      </section>

      <section className="bg-ehsSoftBlue px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl"><p className="font-black text-ehsBlue">How the process works</p><h2 className="mt-2 text-4xl font-black text-ehsBlack">From browsing to move-in, the path is clearer here.</h2></div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[2rem] bg-white p-7 shadow-sm">
                <p className="flex h-11 w-11 items-center justify-center rounded-full bg-ehsBlue text-lg font-black text-white">{index + 1}</p>
                <h3 className="mt-5 text-2xl font-black text-ehsBlack">{step.title}</h3>
                <p className="mt-3 leading-7 text-ehsBlack/70">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-black text-ehsBlue">Videos & Reels</p><h2 className="text-3xl font-black text-ehsBlack">See what’s happening at Easy HomeSource</h2><p className="mt-3 max-w-3xl leading-7 text-ehsBlack/70">Watch home tours, new arrivals, walkthroughs, and helpful videos from the Easy HomeSource team.</p></div>
            <ButtonLink href="/videos" variant="secondary">View All Videos</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-4">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
        </div>
      </section>

      <section className="bg-ehsBlack px-4 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1"><p className="font-black text-ehsBlue">Why choose Easy HomeSource</p><h2 className="mt-2 text-3xl font-black">A simpler way to shop for a manufactured home.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">{reasons.map((reason) => <div key={reason} className="rounded-3xl bg-white/10 p-5 font-semibold leading-7 text-white/85">{reason}</div>)}</div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <InfoBlock title="Turnkey home package guidance" text="Explore home-only purchases, land-and-home package options, budget expectations, lender questions, delivery, setup, site work, and the variables that affect your final path forward." cta="Get Pricing" href="/get-quote" />
          <InfoBlock title="Delivery, setup, and permits" text="Understand the steps after selecting a home, including freight, site work, setup, inspections, permitting timelines, and final quote variables." cta="Schedule a Tour" href="/get-quote" />
        </div>
      </section>

      <section className="bg-ehsSoftBlue px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-black text-ehsBlue">Ready to browse?</p>
            <h2 className="mt-2 text-4xl font-black text-ehsBlack">Compare homes by price, size, beds, baths, and availability.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/get-quote" variant="secondary">Request Info</ButtonLink></div>
          </div>
          <LeadForm cta="Get Pricing" sourcePage="Homepage" />
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return <div className="rounded-[2rem] border border-borderGray bg-white p-8 shadow-sm"><h2 className="text-3xl font-black text-ehsBlack">{title}</h2><p className="mt-4 leading-8 text-ehsBlack/70">{text}</p><div className="mt-6"><ButtonLink href={href} variant="secondary">{cta}</ButtonLink></div></div>;
}
