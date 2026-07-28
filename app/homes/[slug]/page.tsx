import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard, StatusBadge, homeBadges } from "@/components/HomeCard";
import { HomeImage } from "@/components/HomeImage";
import { HomeMediaGallery } from "@/components/HomeMediaGallery";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { formatHomePrice, getHomeBySlug, hasIncompleteCatalogDetails, homes } from "@/data/homes";

const startingPriceDisclaimer = "Starting price does not include delivery, setup, taxes, permits, site work, utility connections, skirting, steps, or selected options.";

export function generateStaticParams() {
  return homes.map((home) => ({ slug: home.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const home = getHomeBySlug(params.slug);
  return {
    title: home?.seoTitle ?? (home ? `${home.name} | Easy HomeSource` : "Home Details | Easy HomeSource"),
    description: home?.seoDescription ?? home?.shortDescription ?? "View manufactured home details from Easy HomeSource in Brooksville, Florida."
  };
}

export default function HomeDetailPage({ params }: { params: { slug: string } }) {
  const home = getHomeBySlug(params.slug);
  if (!home) notFound();

  const homeTitle = home.displayName ?? home.name;
  const photos = home.gallery.filter((item) => item.category !== "floorplan" && item.category !== "video");
  const floorPlan = home.floorPlanImage ?? home.gallery.find((item) => item.category === "floorplan")?.src;
  const videoLink = home.videoUrl ?? home.virtualTourUrl ?? home.walkthroughVideoUrl;
  const isIncomplete = hasIncompleteCatalogDetails(home);
  const pricingHref = `/get-quote?home=${encodeURIComponent(home.slug)}`;
  const tourHref = `/get-quote?home=${encodeURIComponent(home.slug)}&source=schedule-tour`;
  const specs = [
    home.bedrooms != null && Number.isFinite(home.bedrooms) && home.bedrooms > 0 && { label: "Beds", value: home.bedrooms },
    home.bathrooms != null && Number.isFinite(home.bathrooms) && home.bathrooms > 0 && { label: "Baths", value: home.bathrooms },
    home.squareFeet != null && Number.isFinite(home.squareFeet) && home.squareFeet > 0 && { label: "Square feet", value: home.squareFeet.toLocaleString() },
    home.size && { label: "Home size", value: home.size }
  ].filter(Boolean) as { label: string; value: string | number }[];
  const similar = homes.filter((item) => item.slug !== home.slug && (item.bedrooms === home.bedrooms || Math.abs((item.squareFeet ?? 0) - (home.squareFeet ?? 0)) <= 350 || item.isFeatured)).slice(0, 2);

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-5 text-sm font-bold text-ehsBlack/60" aria-label="Breadcrumb">
          <Link href="/homes" className="transition hover:text-ehsBlue">Homes</Link> <span aria-hidden="true">/</span> <span className="text-ehsBlack">{homeTitle}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {homeBadges(home).map((badge) => <span key={badge} className="rounded-full bg-ehsBlue px-3 py-1 text-xs font-black text-white">{badge}</span>)}
              <StatusBadge status={home.status} />
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight text-ehsBlack sm:text-5xl">{homeTitle}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold text-ehsBlack/65">
              {home.manufacturer && <span>Manufacturer: <strong className="text-ehsBlack">{home.manufacturer}</strong></span>}
              {home.modelNumber && <span>Model: <strong className="text-ehsBlack">{home.modelNumber}</strong></span>}
              {home.series && <span>Series: <strong className="text-ehsBlack">{home.series}</strong></span>}
            </div>

            <HomeMediaGallery homeName={homeTitle} gallery={photos} />

            <section className="mt-8 rounded-[2rem] border border-ehsBlue/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-wider text-ehsBlue">About this home</p>
              <h2 className="mt-2 text-2xl font-black text-ehsBlack">Comfort, value, and a plan that fits real life</h2>
              <p className="mt-4 leading-8 text-ehsBlack/75">{home.longDescription ?? home.shortDescription}</p>
              {isIncomplete && <p className="mt-5 rounded-2xl bg-ehsSoftBlue p-4 text-sm font-bold leading-6 text-ehsBlack/70">This home is part of the Easy HomeSource lineup. Final specs, availability, and starting price may vary. Contact us for the latest details.</p>}
            </section>

            <section className="mt-8" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="text-3xl font-black text-ehsBlack">Photo gallery</h2>
              <p className="mt-2 font-semibold text-ehsBlack/60">Explore the spaces and details of the {homeTitle}.</p>
              {photos.length > 1 ? <HomeMediaGallery homeName={homeTitle} gallery={photos.slice(1)} /> : <MediaPlaceholder title="Photos coming soon" className="mt-5 min-h-64" />}
            </section>

            <section className="mt-10" aria-labelledby="floorplan-heading">
              <h2 id="floorplan-heading" className="text-3xl font-black text-ehsBlack">Floor plan</h2>
              <div className="mt-5 overflow-hidden rounded-[2rem] border border-ehsBlue/10 bg-white p-3 shadow-sm">
                {floorPlan
                  ? <HomeImage src={floorPlan} alt={`${homeTitle} floor plan`} className="min-h-[320px] rounded-3xl bg-contain bg-no-repeat sm:min-h-[480px]" placeholderTitle="Floor plan coming soon" />
                  : <MediaPlaceholder title="Floor plan coming soon" className="min-h-[320px] sm:min-h-[480px]" />}
              </div>
            </section>

            <section className="mt-10" aria-labelledby="video-heading">
              <h2 id="video-heading" className="text-3xl font-black text-ehsBlack">Video walkthrough</h2>
              {videoLink ? (
                <div className="mt-5 rounded-[2rem] bg-ehsNavy p-6 text-white sm:p-8">
                  <p className="text-lg font-bold">Take a closer look at the {homeTitle}.</p>
                  <a className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-ehsBlue" href={videoLink}>Watch the video walkthrough</a>
                </div>
              ) : <MediaPlaceholder title="Video walkthrough coming soon" className="mt-5 min-h-64" />}
            </section>

            {home.standardFeatures.length > 0 && <section className="mt-10 rounded-[2rem] border border-borderGray bg-white p-6 sm:p-8">
              <h2 className="text-3xl font-black text-ehsBlack">Home features</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">{home.standardFeatures.map((group) => <div key={group.category} className="rounded-2xl bg-ehsSoftBlue p-5"><h3 className="font-black text-ehsBlack">{group.category}</h3><ul className="mt-3 grid gap-2 text-sm font-semibold text-ehsBlack/75">{group.items.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>)}</div>
            </section>}
          </div>

          <aside className="rounded-[2rem] border border-ehsBlue/15 bg-white p-6 shadow-xl shadow-ehsNavy/10 lg:sticky lg:top-24" aria-label={`${homeTitle} pricing and next steps`}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ehsBlue">Easy HomeSource price</p>
            <p className="mt-2 text-3xl font-black text-ehsBlack">{formatHomePrice(home)}</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-ehsBlack/60">{startingPriceDisclaimer}</p>
            {specs.length ? <dl className="mt-6 grid grid-cols-2 gap-3">{specs.map((spec) => <Detail key={spec.label} {...spec} />)}</dl> : <p className="mt-6 rounded-2xl bg-ehsSoftBlue p-4 text-sm font-bold text-ehsBlack/70">Details coming soon. Ask us for current specs.</p>}
            <div className="mt-6 grid gap-3">
              <ButtonLink href={pricingHref}>Get Pricing for This Home</ButtonLink>
              <ButtonLink href={tourHref} variant="secondary">Schedule a Tour</ButtonLink>
            </div>
            <div className="mt-6 border-t border-borderGray pt-5">
              <p className="font-black text-ehsBlack">Local guidance from start to finish</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ehsBlack/65">Our Brooksville team can help with current availability, options, financing guidance, delivery, setup, and site planning.</p>
              <a href="tel:+13525588888" className="mt-3 inline-block text-sm font-black text-ehsBlue">Call or text 352-558-8888</a>
            </div>
          </aside>
        </div>

        <section className="mt-14"><h2 className="text-3xl font-black text-ehsBlack">Similar homes</h2><div className="mt-6 grid gap-6 md:grid-cols-2">{similar.map((item) => <HomeCard key={item.id} home={item} />)}</div></section>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-ehsSoftBlue p-4"><dt className="text-[0.68rem] font-black uppercase tracking-wide text-ehsBlack/55">{label}</dt><dd className="mt-1 text-lg font-black text-ehsBlack">{value}</dd></div>;
}
