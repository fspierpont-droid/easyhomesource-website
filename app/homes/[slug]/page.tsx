import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { HomeCard, StatusBadge, homeBadges } from "@/components/HomeCard";
import { HomeImage } from "@/components/HomeImage";
import { HomeMediaGallery } from "@/components/HomeMediaGallery";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { formatHomePrice, hasIncompleteCatalogDetails, homes as baselineHomes } from "@/data/homes";
import { getPublicCatalog, getPublicCatalogHome } from "@/lib/catalog/catalogAuthorityServer";
import { publicSiteUrl } from "@/lib/seo/siteIdentity";

const startingPriceDisclaimer = "Starting price does not include delivery, setup, taxes, permits, site work, utility connections, skirting, steps, or selected options.";

export function generateStaticParams() {
  return baselineHomes.map((home) => ({ slug: home.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const home = await getPublicCatalogHome(params.slug);
  const title = home?.seoTitle ?? (home ? `${home.name} | Easy HomeSource` : "Home Details | Easy HomeSource");
  const description = home?.seoDescription ?? home?.shortDescription ?? "View manufactured home details from Easy HomeSource in Brooksville, Florida.";
  const canonical = home ? `/homes/${home.slug}` : `/homes/${params.slug}`;
  const image = home?.image || home?.gallery?.[0]?.src;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(image ? { images: [{ url: image, alt: `${home?.displayName ?? home?.name ?? "Easy HomeSource manufactured home"}` }] } : {}),
    },
  };
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function HomeDetailPage({ params }: { params: { slug: string } }) {
  const catalog = await getPublicCatalog();
  const home = catalog.find((item) => item.slug === params.slug);
  if (!home) notFound();

  const homeTitle = home.displayName ?? home.name;
  const homeUrl = `${publicSiteUrl}/homes/${home.slug}`;
  const photos = home.gallery.filter((item) => item.category !== "floorplan" && item.category !== "video");
  const floorPlan = home.floorPlanImage ?? home.gallery.find((item) => item.category === "floorplan")?.src;
  const videoLink = home.videoUrl ?? home.walkthroughVideoUrl ?? home.virtualTourUrl;
  const is3dTour = Boolean(home.virtualTourUrl && !home.videoUrl && !home.walkthroughVideoUrl);
  const isIncomplete = hasIncompleteCatalogDetails(home);
  const pricingHref = `/get-quote?home=${encodeURIComponent(home.slug)}`;
  const tourHref = `/get-quote?home=${encodeURIComponent(home.slug)}&source=schedule-tour`;
  const specs = [
    home.bedrooms != null && Number.isFinite(home.bedrooms) && home.bedrooms > 0 && { label: "Beds", value: home.bedrooms },
    home.bathrooms != null && Number.isFinite(home.bathrooms) && home.bathrooms > 0 && { label: "Baths", value: home.bathrooms },
    home.squareFeet != null && Number.isFinite(home.squareFeet) && home.squareFeet > 0 && { label: "Square feet", value: home.squareFeet.toLocaleString() },
    home.size && { label: "Home size", value: home.size }
  ].filter(Boolean) as { label: string; value: string | number }[];
  const similar = catalog.filter((item) => item.slug !== home.slug && (item.bedrooms === home.bedrooms || Math.abs((item.squareFeet ?? 0) - (home.squareFeet ?? 0)) <= 350 || item.isFeatured)).slice(0, 2);
  const productPrice = home.salePrice ?? home.startingPrice;
  const productImages = Array.from(new Set([home.image, ...photos.map((photo) => photo.src)].filter((value): value is string => Boolean(value)))).slice(0, 8);
  const availability = home.status === "Sold"
    ? "https://schema.org/OutOfStock"
    : home.isOnDisplay
      ? "https://schema.org/InStock"
      : "https://schema.org/PreOrder";

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: homeTitle,
    url: homeUrl,
    description: home.seoDescription ?? home.shortDescription ?? home.longDescription,
    ...(productImages.length ? { image: productImages } : {}),
    ...(home.manufacturer ? { brand: { "@type": "Brand", name: home.manufacturer } } : {}),
    ...(home.modelNumber ? { model: home.modelNumber } : {}),
    category: "Manufactured Home",
    additionalProperty: [
      home.bedrooms != null ? { "@type": "PropertyValue", name: "Bedrooms", value: home.bedrooms } : null,
      home.bathrooms != null ? { "@type": "PropertyValue", name: "Bathrooms", value: home.bathrooms } : null,
      home.squareFeet != null ? { "@type": "PropertyValue", name: "Square Feet", value: home.squareFeet, unitText: "sq ft" } : null,
      home.size ? { "@type": "PropertyValue", name: "Home Size", value: home.size } : null,
    ].filter(Boolean),
    ...(typeof productPrice === "number" && Number.isFinite(productPrice) && productPrice > 0 ? {
      offers: {
        "@type": "Offer",
        url: homeUrl,
        priceCurrency: "USD",
        price: productPrice.toFixed(2),
        availability,
        seller: {
          "@type": "Organization",
          name: "Easy HomeSource",
          url: publicSiteUrl,
        },
        description: startingPriceDisclaimer,
      },
    } : {}),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: publicSiteUrl },
      { "@type": "ListItem", position: 2, name: "Homes", item: `${publicSiteUrl}/homes` },
      { "@type": "ListItem", position: 3, name: homeTitle, item: homeUrl },
    ],
  };

  return (
    <main className="px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbStructuredData) }} />
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
              {home.homeType && <span>Type: <strong className="text-ehsBlack">{home.homeType}</strong></span>}
            </div>

            <HomeMediaGallery homeName={homeTitle} gallery={photos} />

            <section className="mt-8 rounded-[2rem] border border-ehsBlue/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-wider text-ehsBlue">About this home</p>
              <h2 className="mt-2 text-2xl font-black text-ehsBlack">Comfort, value, and a plan that fits real life</h2>
              <p className="mt-4 leading-8 text-ehsBlack/75">{home.longDescription ?? home.shortDescription}</p>
              {isIncomplete && <p className="mt-5 rounded-2xl bg-ehsSoftBlue p-4 text-sm font-bold leading-6 text-ehsBlack/70">This home is part of the Easy HomeSource lineup. Final specs, availability, and starting price may vary. Contact us for the latest details.</p>}
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
              <h2 id="video-heading" className="text-3xl font-black text-ehsBlack">3D tour & walkthrough</h2>
              {videoLink ? (
                <div className="mt-5 rounded-[2rem] bg-ehsNavy p-6 text-white sm:p-8">
                  <p className="text-lg font-bold">Take a closer look at the {homeTitle}.</p>
                  <a
                    className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-ehsBlue"
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {is3dTour ? "Open the 3D home tour" : "Watch the video walkthrough"}
                  </a>
                </div>
              ) : <MediaPlaceholder title="3D tour or walkthrough coming soon" className="mt-5 min-h-64" />}
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
              {home.brochureUrl && (
                <a
                  href={home.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ehsBlue px-5 py-3 text-center text-sm font-black text-ehsBlue transition hover:bg-ehsSoftBlue"
                >
                  View Factory Brochure
                </a>
              )}
              {home.manufacturerUrl && (
                <a
                  href={home.manufacturerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-borderGray px-5 py-3 text-center text-sm font-black text-ehsBlack transition hover:border-ehsBlue hover:text-ehsBlue"
                >
                  Manufacturer Details
                </a>
              )}
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
