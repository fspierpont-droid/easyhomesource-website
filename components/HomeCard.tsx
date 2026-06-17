import Link from "next/link";
import type { Home, HomeStatus } from "@/data/homes";
import { catalogPriceDisclaimer, formatHomePrice } from "@/data/homes";
import { HomeImage } from "@/components/HomeImage";

const statusStyles: Record<HomeStatus, string> = { Available: "bg-ehsLightBlue/60 text-ehsBlack ring-ehsBlue/20", "Coming Soon": "bg-ehsMediumBlue/25 text-ehsBlack ring-ehsMediumBlue/20", Sold: "bg-borderGray text-ehsBlack ring-ehsBlack/10" };
export function StatusBadge({ status }: { status: HomeStatus }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}>{status}</span>; }
export function homeBadges(home: Home) { return [home.isFeatured && "Featured", home.isOnDisplay && "On Display", home.isCatalogModel && "Online Catalog", home.isSpecialOffer && "Special Offer", home.isNewArrival && "New Arrival", home.isComingSoon && "Coming Soon"].filter(Boolean) as string[]; }

export function HomeCard({ home }: { home: Home }) {
  const primary = home.gallery.find((item) => item.isPrimary) ?? home.gallery[0];
  const specs = [home.bedrooms != null && { label: "Beds", value: home.bedrooms }, home.bathrooms != null && { label: "Baths", value: home.bathrooms }, home.squareFeet != null && { label: "Sq. Ft.", value: home.squareFeet.toLocaleString() }, home.size && { label: "Size", value: home.size }].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-borderGray bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/homes/${home.slug}`} aria-label={`View details for ${home.displayName ?? home.name}`} className="absolute inset-0 z-10 rounded-[1.75rem] focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/70" />
      <div className="relative min-h-64 overflow-hidden bg-ehsSoftBlue">
        <HomeImage src={primary?.src} alt={primary?.alt ?? `${home.name} photo`} className="min-h-64 rounded-none" />
        <span className="absolute right-5 top-5"><StatusBadge status={home.status} /></span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <div>{home.modelNumber && <p className="text-sm font-semibold text-ehsBlue">{home.modelNumber}</p>}<h3 className="mt-1 text-2xl font-black leading-tight text-ehsBlack">{home.name}</h3></div>
        <div className="flex flex-wrap gap-2">{homeBadges(home).map((badge) => <span key={badge} className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsBlack">{badge}</span>)}</div>
        <div className="rounded-2xl bg-ehsSoftBlue/70 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-ehsBlack/60">{home.priceLabel ?? "Price"}</p>
          <p className="mt-1 text-3xl font-black text-ehsBlack">{formatHomePrice(home)}</p>
          <p className="mt-2 text-xs font-semibold text-ehsBlack/55">Final quote required.</p>
        </div>
        {specs.length > 0 && <dl className="grid grid-cols-2 gap-3 text-sm">{specs.map((spec) => <Spec key={spec.label} {...spec} />)}</dl>}
        <div className="relative z-20 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex flex-1 justify-center rounded-full bg-ehsBlue px-5 py-3 text-sm font-black text-white transition hover:bg-ehsMediumBlue" href={`/homes/${home.slug}`}>View Details</Link>
          <Link className="inline-flex flex-1 justify-center rounded-full border border-ehsBlue bg-white px-5 py-3 text-sm font-black text-ehsBlue transition hover:bg-ehsSoftBlue" href={`/homes/${home.slug}#lead-form`}>Get Pricing</Link>
        </div>
      </div>
    </article>
  );
}
function Spec({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-borderGray bg-white p-3"><dt className="text-xs font-black uppercase tracking-wide text-ehsBlack/55">{label}</dt><dd className="mt-1 break-words text-base font-black text-ehsBlack">{value}</dd></div>; }
