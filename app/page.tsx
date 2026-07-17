import { ButtonLink } from "@/components/ButtonLink";
import { HomeImage } from "@/components/HomeImage";
import { LeadForm } from "@/components/LeadForm";
import { VideoCard } from "@/components/VideoCard";
import Link from "next/link";
import { formatHomePrice, getFeaturedHomes, getHomeBySlug, type Home } from "@/data/homes";
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
  const homepageFeaturedHomes = [
    { home: getHomeBySlug("tulip"), price: "$39,888" },
    { home: getHomeBySlug("dogwood"), price: "$61,900" },
    { home: getHomeBySlug("born-to-run"), price: "$89,875" },
    { home: getHomeBySlug("paxton"), price: "$158,888" }
  ].filter((item): item is { home: Home; price: string } => Boolean(item.home));
  const displayHomeCount = featuredHomes.filter((home) => home.isOnDisplay).length;
  const tulip = getHomeBySlug("tulip");
  const dogwood = getHomeBySlug("dogwood");
  const bornToRun = getHomeBySlug("born-to-run");

  return (
    <main>
      <section className="relative overflow-hidden bg-ehsSoftBlue px-4 py-10 sm:py-12 lg:py-8 xl:py-10">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-ehsBlue/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] xl:gap-10">
          <div className="relative">
            <p className="font-black uppercase tracking-wide text-ehsBlue">Manufactured homes in Brooksville, Florida</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight text-ehsBlack sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">Affordable Florida manufactured homes, without the guesswork.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-ehsBlack/75">Easy HomeSource helps buyers compare homes, understand pricing, explore financing options, and get support through delivery, setup, permitting, and move-in.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/homes">View Available Homes</ButtonLink>
              <ButtonLink href="/get-quote" variant="secondary">Get Pricing</ButtonLink>
              <ButtonLink href="/financing" variant="secondary">Check Financing Options</ButtonLink>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-borderGray bg-white/80 p-3.5 shadow-sm">
                  <p className="text-sm font-black text-ehsBlue">{point.label}</p>
                  <p className="mt-1 font-black text-ehsBlack">{point.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-white p-3 shadow-2xl shadow-ehsBlack/10">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-ehsBlack via-ehsBlack to-ehsBlue p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase tracking-wide text-white/70">Homes you can tour today</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ehsBlack">Brooksville, FL</span>
              </div>
              <h2 className="mt-4 text-3xl font-black leading-tight">Start with real homes, then build the right plan.</h2>
              <p className="mt-3 leading-6 text-white/80">Walk through homes on the lot, compare monthly-budget expectations, and talk through the real project pieces before making a decision.</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                <div className="flex min-h-16 items-center rounded-2xl bg-white/15 p-3"><p className="text-sm font-black leading-5">{displayHomeCount} homes on display</p></div>
                <div className="flex min-h-16 items-center rounded-2xl bg-white/15 p-3"><p className="text-sm font-black leading-5">Featured from {tulip ? formatHomePrice(tulip) : "$39,888"}</p></div>
                <div className="flex min-h-16 items-center rounded-2xl bg-white/15 p-3"><p className="text-sm font-black leading-5">Call/Text 352-558-8888</p></div>
              </div>
              <div className="mt-4 grid gap-2.5">
                {[tulip, dogwood, bornToRun].filter(Boolean).map((home) => (
                  <div key={home!.slug} className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3">
                    <div className="min-w-0">
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

      <section className="bg-ehsSoftBlue px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-ehsNavy/10 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-64 overflow-hidden bg-ehsNavy lg:min-h-[22rem]">
              <HomeImage src={tulip?.gallery.find((item) => item.isPrimary)?.src ?? tulip?.gallery[0]?.src} alt="The Tulip affordable manufactured home" className="absolute inset-0 h-full min-h-64 rounded-none lg:min-h-[22rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ehsBlack/90 via-ehsBlack/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-sm font-black uppercase tracking-wide text-white/75">Featured affordable home</p>
                <h2 className="mt-1 text-3xl font-black sm:text-4xl">The Tulip</h2>
                {tulip && <p className="mt-2 font-bold text-white/85">{tulip.bedrooms} beds • {tulip.bathrooms} bath • {tulip.squareFeet?.toLocaleString()} sq. ft.</p>}
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="font-black text-ehsBlue">A practical path to homeownership</p>
              <h3 className="mt-2 text-3xl font-black text-ehsBlack sm:text-4xl">Starting at $39,888</h3>
              <p className="mt-3 max-w-xl leading-7 text-ehsBlack/70">A budget-friendly home with a smart, efficient layout—available to explore with help from our local Brooksville team.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><ButtonLink href="/get-quote?home=tulip">Get Pricing</ButtonLink><ButtonLink href="/get-quote?home=tulip" variant="secondary">Schedule a Tour</ButtonLink><ButtonLink href="tel:+13525588888" variant="secondary">Call/Text 352-558-8888</ButtonLink></div>
              <p className="mt-4 border-t border-borderGray pt-3 text-xs font-semibold leading-5 text-ehsBlack/55">Home availability, pricing, financing, delivery and setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-black text-ehsBlue">Featured homes</p><h2 className="text-3xl font-black text-ehsBlack">Popular homes for Florida buyers</h2></div>
            <ButtonLink href="/homes" variant="secondary">View Available Homes</ButtonLink>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{homepageFeaturedHomes.map(({ home, price }) => <HomepageHomeCard key={home.id} home={home} price={price} />)}</div>
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

function HomepageHomeCard({ home, price }: { home: Home; price: string }) {
  const primary = home.gallery.find((item) => item.isPrimary) ?? home.gallery[0];
  return <article className="group overflow-hidden rounded-[1.5rem] border border-ehsBlue/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <Link href={`/homes/${home.slug}`} className="block overflow-hidden bg-white" aria-label={`View ${home.displayName ?? home.name}`}>
      <HomeImage src={primary?.src} alt={primary?.alt ?? `${home.name} exterior`} className="h-44 rounded-none transition duration-500 group-hover:scale-105" />
    </Link>
    <div className="p-5">
      <h3 className="text-xl font-black text-ehsNavy">{home.displayName ?? home.name}</h3>
      <p className="mt-1 text-sm font-semibold text-ehsBlack/60">{home.bedrooms} beds • {home.bathrooms} baths • {home.squareFeet?.toLocaleString()} sq. ft.</p>
      <p className="mt-3 text-2xl font-black text-ehsBlue">{price}</p>
      <Link href={`/homes/${home.slug}`} className="mt-4 inline-flex w-full justify-center rounded-full bg-ehsBlue px-5 py-2.5 text-sm font-black text-white transition hover:bg-ehsDeepBlue">View Home</Link>
    </div>
  </article>;
}
