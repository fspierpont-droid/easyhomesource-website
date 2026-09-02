import Link from "next/link";
import { HomeImage } from "@/components/HomeImage";
import { VideoCard } from "@/components/VideoCard";
import { formatHomePrice, getHomeBySlug, homes, type Home } from "@/data/homes";
import { videos } from "@/data/videos";

const buyerPaths = [
  {
    eyebrow: "I already own land",
    title: "Find the home that fits the property.",
    text: "Start with the floor plan, then work through delivery, setup, site conditions, permitting, utilities, and the final project quote.",
    href: "/get-quote?path=own-land",
    cta: "Plan My Home",
    tone: "light",
  },
  {
    eyebrow: "I need a home + land",
    title: "Build the whole path in one place.",
    text: "Explore land-and-home possibilities with one team helping you connect the home, homesite, site work, financing conversation, and next steps.",
    href: "/packages",
    cta: "Explore Land + Home",
    tone: "navy",
  },
  {
    eyebrow: "I only need the home",
    title: "Shop the floor plan first.",
    text: "Compare homes by bedrooms, baths, square footage, layout, manufacturer, starting price, and current EHS availability.",
    href: "/homes",
    cta: "Explore Homes",
    tone: "sand",
  },
  {
    eyebrow: "I am starting with budget",
    title: "See what may fit before you fall in love.",
    text: "Start with your budget and financing questions, then narrow the catalog to homes and project paths worth exploring.",
    href: "/financing",
    cta: "Start With Budget",
    tone: "blue",
  },
] as const;

const processSteps = [
  { number: "01", title: "Discover", text: "Compare real homes, floor plans, sizes, and starting prices." },
  { number: "02", title: "Tour", text: "Walk through display homes at our Brooksville location when available." },
  { number: "03", title: "Plan", text: "Talk through financing, land status, budget, and the home you want." },
  { number: "04", title: "Site", text: "Review the property, utilities, permitting needs, and site-work variables." },
  { number: "05", title: "Quote", text: "Bring the home and project pieces together into a clearer final plan." },
  { number: "06", title: "Deliver", text: "Coordinate delivery, setup, inspections, and the steps toward completion." },
  { number: "07", title: "Move In", text: "Finish the project path and get ready to make the home yours." },
] as const;

function nameOf(home: Home) {
  return home.displayName ?? home.name;
}

function imageFor(home?: Home | null, preferred: string[] = []) {
  if (!home) return null;
  for (const category of preferred) {
    const match = home.gallery.find((item) => item.category === category);
    if (match) return match;
  }
  return home.gallery.find((item) => item.isPrimary) ?? home.gallery[0] ?? null;
}

function specs(home: Home) {
  return [
    home.bedrooms ? `${home.bedrooms} bed` : null,
    home.bathrooms ? `${home.bathrooms} bath` : null,
    home.squareFeet ? `${home.squareFeet.toLocaleString()} sq. ft.` : null,
  ].filter(Boolean).join("  •  ");
}

export function PremiumHomepage() {
  const activeHomes = homes.filter((home) => home.isActive);
  const displayHomes = activeHomes.filter((home) => home.isOnDisplay);

  const boujee = getHomeBySlug("boujee-xl-2");
  const paxton = getHomeBySlug("paxton");
  const whiteOak = getHomeBySlug("white-oak");
  const delilah = getHomeBySlug("delilah");
  const tulip = getHomeBySlug("tulip");
  const heroHome = boujee ?? paxton ?? whiteOak ?? tulip ?? activeHomes[0];
  const heroImage = imageFor(heroHome, ["kitchen", "interior", "exterior"]);
  const heroSecondary = imageFor(heroHome, ["exterior", "kitchen", "interior"]);

  const editorialHomes = [boujee, paxton, whiteOak, delilah]
    .filter((home): home is Home => Boolean(home))
    .slice(0, 3);

  const layoutHome = whiteOak ?? delilah ?? paxton ?? heroHome;
  const layoutPhoto = imageFor(layoutHome, ["kitchen", "interior", "exterior"]);
  const floorPlan = layoutHome?.floorPlanImage
    ? { src: layoutHome.floorPlanImage, alt: `${nameOf(layoutHome)} floor plan` }
    : imageFor(layoutHome, ["floorplan"]);

  return (
    <main className="overflow-hidden bg-[#f8fafc] text-[#0b1e38]">
      <section className="relative min-h-[82vh] overflow-hidden bg-[#081725] text-white">
        <div className="absolute inset-0">
          <HomeImage
            src={heroImage?.src ?? heroSecondary?.src}
            alt={heroImage?.alt ?? `${nameOf(heroHome)} manufactured home`}
            className="h-full min-h-[82vh] w-full rounded-none"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,18,31,0.97)_0%,rgba(5,18,31,0.84)_42%,rgba(5,18,31,0.34)_72%,rgba(5,18,31,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(30,111,168,0.30),transparent_34%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-end px-5 pb-10 pt-24 sm:px-8 sm:pb-14 lg:items-center lg:px-10 lg:pb-0 lg:pt-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                Brooksville, Florida · Modern manufactured homes
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
                A better way home.
                <span className="mt-2 block text-[#92c9ea]">Designed for Florida living.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/78 sm:text-xl">
                Discover modern manufactured homes, land + home possibilities, financing guidance, and a clearer path from floor plan to move-in — all with one local team.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/homes" className="inline-flex min-h-13 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-black text-[#081725] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#eaf6ff]">
                  Explore Homes
                </Link>
                <Link href="/get-quote?path=land-home" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/18">
                  Find Land + Home
                </Link>
                <Link href="/financing" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10">
                  See What May Fit My Budget
                </Link>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="max-w-md rounded-[2rem] border border-white/18 bg-[#071421]/78 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#78bce7]">Start with what matters</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-2xl font-black">{activeHomes.length}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/55">Home designs</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-2xl font-black">{displayHomes.length}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/55">On display</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-2xl font-black">1</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/55">Local team</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-black">Featured: {nameOf(heroHome)}</p>
                    <p className="mt-1 text-xs font-semibold text-white/60">{specs(heroHome)}</p>
                  </div>
                  <Link href={`/homes/${heroHome.slug}`} className="shrink-0 text-xs font-black text-[#8cc8ec] hover:text-white">View →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-5 sm:grid-cols-4 sm:divide-y-0 sm:px-8 lg:px-10">
          {["Real floor plans", "Clear starting prices", "Land + home guidance", "Florida delivery support"].map((item) => (
            <div key={item} className="px-4 py-5 text-center text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 sm:py-6">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e6fa8]">Start where you are</p>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">Your path should fit your life.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:justify-self-end">
              Buying a manufactured home can involve more than choosing a floor plan. We make the first decision simpler by starting with the question that actually changes the journey: what do you already have, and what do you still need?
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {buyerPaths.map((path, index) => {
              const tones = {
                light: "bg-white border-slate-200 text-[#0b1e38]",
                navy: "bg-[#0b1e38] border-[#0b1e38] text-white",
                sand: "bg-[#f3eee5] border-[#e8dfd1] text-[#0b1e38]",
                blue: "bg-[#dff1fb] border-[#c8e7f7] text-[#0b1e38]",
              } as const;
              return (
                <Link key={path.title} href={path.href} className={`group flex min-h-[19rem] flex-col justify-between rounded-[2rem] border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${tones[path.tone]}`}>
                  <div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${path.tone === "navy" ? "bg-white/12 text-white" : "bg-[#0b1e38] text-white"}`}>{String(index + 1).padStart(2, "0")}</div>
                    <p className={`mt-6 text-[10px] font-black uppercase tracking-[0.18em] ${path.tone === "navy" ? "text-[#8cc8ec]" : "text-[#1e6fa8]"}`}>{path.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em]">{path.title}</h3>
                    <p className={`mt-3 text-sm leading-6 ${path.tone === "navy" ? "text-white/68" : "text-slate-600"}`}>{path.text}</p>
                  </div>
                  <p className={`mt-7 text-sm font-black ${path.tone === "navy" ? "text-white" : "text-[#0b1e38]"}`}>{path.cta} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#081725] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7bc0e8]">Homes that change expectations</p>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">See the home. Feel the space. Then talk numbers.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">The homepage should not make beautiful homes feel like spreadsheet rows. Start with the rooms, the layout, and the way the home actually lives.</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            {editorialHomes.map((home, index) => {
              const photo = imageFor(home, index === 0 ? ["kitchen", "interior", "exterior"] : ["exterior", "kitchen", "interior"]);
              const span = index === 0 ? "lg:col-span-7 lg:row-span-2 min-h-[32rem]" : "lg:col-span-5 min-h-[15.5rem]";
              return (
                <Link key={home.slug} href={`/homes/${home.slug}`} className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10263b] ${span}`}>
                  <HomeImage src={photo?.src} alt={photo?.alt ?? `${nameOf(home)} home`} className="absolute inset-0 h-full w-full rounded-none transition duration-700 group-hover:scale-[1.035]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06111d]/95 via-[#06111d]/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#92c9ea]">{home.manufacturer}</p>
                        <h3 className={`${index === 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"} mt-1 font-black tracking-[-0.04em]`}>{nameOf(home)}</h3>
                        <p className="mt-2 text-sm font-semibold text-white/68">{specs(home)}</p>
                      </div>
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-xs font-bold text-white/55">Starting price</p>
                        <p className="mt-1 text-lg font-black">{formatHomePrice(home).replace("Starting at ", "")}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/homes" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-[#081725] transition hover:bg-[#dff1fb]">Explore All Homes</Link>
            <Link href="/get-quote?source=homepage&cta=tour" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10">Schedule a Tour</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee5] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e6fa8]">Built differently. Not built less.</p>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">Modern factory-built homes deserve a modern buying experience.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-650 text-slate-600">
              Today&apos;s manufactured homes can offer open layouts, large kitchens, thoughtful storage, modern finishes, and efficient use of space. The value is not about settling — it is about choosing a smarter path to the home you want.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Controlled factory construction", "Modern floor plans and finishes", "Clearer home-by-home comparison", "Local delivery and setup guidance"].map((item) => (
                <div key={item} className="rounded-2xl border border-[#ded3c2] bg-white/72 px-4 py-4 text-sm font-black text-[#0b1e38]">{item}</div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/how-it-works" className="inline-flex items-center justify-center rounded-full bg-[#0b1e38] px-6 py-3 text-sm font-black text-white transition hover:bg-[#133a5e]">See How It Works</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-white shadow-xl sm:translate-y-8">
              <HomeImage src={layoutPhoto?.src} alt={layoutPhoto?.alt ?? `${nameOf(layoutHome)} interior`} className="absolute inset-0 h-full w-full rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081725]/88 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#92c9ea]">See the finishes</p>
                <p className="mt-2 text-2xl font-black">{nameOf(layoutHome)}</p>
              </div>
            </div>
            <div className="flex min-h-[28rem] flex-col rounded-[2rem] bg-white p-4 shadow-xl sm:-translate-y-8">
              <div className="flex items-center justify-between px-2 pb-4 pt-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1e6fa8]">Understand the layout</p>
                  <p className="mt-1 font-black text-[#0b1e38]">Floor plan first</p>
                </div>
                <span className="rounded-full bg-[#e9f5fb] px-3 py-1 text-[10px] font-black text-[#1e6fa8]">{layoutHome.squareFeet?.toLocaleString()} SQ FT</span>
              </div>
              <HomeImage src={floorPlan?.src} alt={floorPlan?.alt ?? `${nameOf(layoutHome)} floor plan`} className="min-h-0 flex-1 rounded-[1.35rem] border border-slate-100" placeholderTitle="Floor plan available on the home detail page" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-[#0b1e38] text-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#86c8ed]">Land + home</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">Don&apos;t have land? That does not have to stop the conversation.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">Easy HomeSource can help you explore the home and homesite conversation together, including the project variables that can change the real cost and timeline.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/packages" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-[#0b1e38]">Explore Land + Home</Link>
                <Link href="/get-quote?path=land-home" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white">Tell Us What You Need</Link>
              </div>
            </div>
            <div className="relative min-h-[28rem] overflow-hidden bg-[radial-gradient(circle_at_30%_25%,rgba(67,169,224,0.45),transparent_22%),linear-gradient(145deg,#123c5f_0%,#081725_72%)] p-7 sm:p-10">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="relative flex h-full min-h-[22rem] flex-col justify-between">
                <div className="flex justify-end"><span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur">Central Florida</span></div>
                <div className="space-y-3">
                  {["Choose the home", "Understand the homesite", "Plan the site work", "Bring the project together"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#75bee8] text-xs font-black text-[#071421]">{index + 1}</span>
                      <span className="text-sm font-black">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e6fa8]">From “I want a home” to “welcome home”</p>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">The process feels better when you can see what comes next.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-7">
            {processSteps.map((step) => (
              <div key={step.number} className="bg-[#f8fafc] p-5 lg:min-h-[15rem]">
                <p className="text-xs font-black text-[#1e6fa8]">{step.number}</p>
                <h3 className="mt-8 text-xl font-black tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">Exact steps, costs, approvals, contractor requirements, permitting, financing, delivery, setup, and timelines vary by home, property, jurisdiction, lender, and final quote.</p>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="bg-[#edf6fb] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e6fa8]">Walk through before you drive over</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">See the homes in motion.</h2>
              </div>
              <Link href="/videos" className="text-sm font-black text-[#0b1e38]">View all videos →</Link>
            </div>
            <div className="mt-9 grid gap-5 lg:grid-cols-2">
              {videos.slice(0, 2).map((video) => <VideoCard key={video.id} video={video} />)}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-[#071421] px-5 py-24 text-white sm:px-8 lg:px-10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#1e6fa8]/25 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8cc8ec]">Why rent when you can own?</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl">Homeownership may be closer than it looks from the outside.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">Start with the home, your land situation, and the budget conversation. We will help you understand the next questions before you commit.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/homes" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#081725]">Explore Homes</Link>
            <Link href="/get-quote" className="inline-flex items-center justify-center rounded-full bg-[#1e6fa8] px-7 py-3.5 text-sm font-black text-white">Build My Starting Plan</Link>
            <Link href="/financing" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-black text-white">Financing Options</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
