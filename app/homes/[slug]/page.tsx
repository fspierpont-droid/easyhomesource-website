import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard, StatusBadge, homeBadges } from "@/components/HomeCard";
import { HomeMediaGallery } from "@/components/HomeMediaGallery";
import { LeadForm } from "@/components/LeadForm";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { formatHomePrice, getHomeBySlug, homes } from "@/data/homes";
import { siteInfo } from "@/data/site";

export function generateStaticParams() { return homes.map((home) => ({ slug: home.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const home = getHomeBySlug(params.slug); return { title: home?.seoTitle ?? (home ? `${home.name} | Easy HomeSource` : "Home Details | Easy HomeSource"), description: home?.seoDescription ?? home?.shortDescription ?? "View manufactured home details from Easy HomeSource in Brooksville, Florida." }; }

export default function HomeDetailPage({ params }: { params: { slug: string } }) {
  const home = getHomeBySlug(params.slug); if (!home) notFound();
  const homeTitle = home.displayName ?? home.name;
  const specs: { label: string; value: string | number }[] = [];
  if (home.bedrooms != null) specs.push({ label: "Beds", value: home.bedrooms });
  if (home.bathrooms != null) specs.push({ label: "Baths", value: home.bathrooms });
  if (home.squareFeet != null) specs.push({ label: "Sq. Ft.", value: home.squareFeet.toLocaleString() });
  if (home.size) specs.push({ label: "Size", value: home.size });
  const videoLink: string | undefined = home.videoUrl ?? home.virtualTourUrl ?? home.walkthroughVideoUrl ?? undefined;
  const brochureUrl: string | undefined = home.brochureUrl ?? undefined;
  const similar = homes.filter((item) => item.slug !== home.slug && (item.bedrooms === home.bedrooms || Math.abs((item.squareFeet ?? 0) - (home.squareFeet ?? 0)) <= 350 || item.isFeatured)).slice(0, 2);

  return (
    <main className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <section>
          <div className="flex flex-wrap items-center gap-3">{homeBadges(home).map((badge) => <span key={badge} className="rounded-full bg-ehsBlue px-3 py-1 text-xs font-black text-white">{badge}</span>)}<StatusBadge status={home.status} /></div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-black text-ehsBlack sm:text-5xl">{homeTitle}</h1>
              {home.modelNumber && <p className="mt-2 font-black text-ehsBlue">Model {home.modelNumber}</p>}
              {home.manufacturer && <p className="mt-1 font-semibold text-ehsBlack/70">{home.manufacturer}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end"><ButtonLink href="#lead-form">Get Pricing</ButtonLink><ButtonLink href="tel:+13525588888" variant="secondary">Call/Text</ButtonLink></div>
          </div>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ehsBlack/75">{home.shortDescription}</p>

          <HomeMediaGallery homeName={home.displayName ?? home.name} gallery={home.gallery} />

          <section className="mt-8">
            <h2 className="text-2xl font-black text-ehsBlack">Videos</h2>
            {videoLink ? <div className="mt-4 rounded-3xl border border-borderGray bg-white p-6"><a className="font-black text-ehsBlue" href={videoLink}>Open video or virtual tour</a></div> : <MediaPlaceholder title="Video tour coming soon" className="mt-4" />}
          </section>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5"><Detail label="Price" value={formatHomePrice(home)} />{specs.map((spec) => <Detail key={spec.label} {...spec} />)}</dl>
          <p className="mt-6 rounded-2xl border border-borderGray bg-white p-4 text-sm font-semibold leading-6 text-ehsBlack/70">{home.priceDisclaimer ?? siteInfo.pricingDisclaimer}</p>
          <section className="mt-8 rounded-3xl border border-borderGray bg-white p-6"><h2 className="text-2xl font-black text-ehsBlack">Description</h2><p className="mt-4 leading-8 text-ehsBlack/75">{home.longDescription ?? home.shortDescription}</p></section>
          <section className="mt-8 rounded-3xl border border-borderGray bg-white p-6"><h2 className="text-2xl font-black text-ehsBlack">Standard features</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{home.standardFeatures.map((group) => <div key={group.category} className="rounded-2xl bg-ehsSoftBlue p-5"><h3 className="font-black text-ehsBlack">{group.category}</h3><ul className="mt-3 grid gap-2 text-sm font-semibold text-ehsBlack/75">{group.items.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>)}</div></section>
          {brochureUrl && <section className="mt-8"><ButtonLink href={brochureUrl}>View Brochure</ButtonLink></section>}
          <div className="mt-8 rounded-[2rem] bg-ehsBlue p-8 text-white"><h2 className="text-3xl font-black">Want pricing for this home?</h2><p className="mt-3 leading-7 text-white/75">Ask about current availability, financing guidance, delivery, setup, permitting, and move-in timing.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><ButtonLink href="#lead-form">Get Pricing</ButtonLink><ButtonLink href="/contact" variant="secondary">Schedule Tour</ButtonLink><ButtonLink href="tel:+13525588888" variant="secondary">Call/Text 352-558-8888</ButtonLink></div></div>
          <section id="lead-form" className="mt-10 scroll-mt-28 rounded-[2rem] border border-borderGray bg-white p-5 shadow-sm sm:p-8"><div className="mb-6 max-w-3xl"><p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Request pricing</p><h2 className="mt-2 text-3xl font-black text-ehsBlack">Get a quote on {homeTitle}</h2><p className="mt-3 leading-7 text-ehsBlack/70">Submit the form below and the Easy HomeSource Brooksville team can follow up on availability, financing options, delivery, setup, and permitting.</p></div><LeadForm interestedHome={home.name} interestedHomeSlug={home.slug} cta="Get Pricing" sourcePage={`${home.name} home detail`} /></section>
          <section className="mt-12"><h2 className="text-3xl font-black text-ehsBlack">Similar homes</h2><div className="mt-6 grid gap-6 md:grid-cols-2">{similar.map((item) => <HomeCard key={item.id} home={item} />)}</div></section>
        </section>
      </div>
    </main>
  );
}
function Detail({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-ehsSoftBlue p-4"><dt className="text-xs font-black uppercase tracking-wide text-ehsBlack/60">{label}</dt><dd className="mt-1 text-xl font-black text-ehsBlack">{value}</dd></div>; }