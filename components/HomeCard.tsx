import Link from "next/link";
import type { Home, HomeStatus } from "@/data/homes";
import { formatHomePrice } from "@/data/homes";
import { HomeImage } from "@/components/HomeImage";

const statusStyles: Record<HomeStatus, string> = { Available: "bg-ehsLightBlue/70 text-ehsNavy ring-ehsBlue/20", "Coming Soon": "bg-ehsMediumBlue/25 text-ehsNavy ring-ehsMediumBlue/20", Sold: "bg-borderGray text-ehsBlack ring-ehsBlack/10" };
export function StatusBadge({ status }: { status: HomeStatus }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}>{status}</span>; }
export function homeBadges(home: Home) { return [home.isFeatured && "Featured", home.isOnDisplay && "On Display", home.isCatalogModel && "Online Catalog", home.isSpecialOffer && "Special Offer", home.isNewArrival && "New Arrival", home.isComingSoon && "Coming Soon"].filter(Boolean) as string[]; }

export function HomeCard({ home }: { home: Home }) {
  const primary = home.gallery.find((item) => item.isPrimary) ?? home.gallery[0];
  const specs = [
    { label: "Beds", value: home.bedrooms != null ? home.bedrooms : "Ask" },
    { label: "Baths", value: home.bathrooms != null ? home.bathrooms : "Ask" },
    { label: "Sq. Ft.", value: home.squareFeet != null ? home.squareFeet.toLocaleString() : "Ask" }
  ];

  return (
    <article className="group h-full overflow-hidden rounded-[1.75rem] border border-ehsBlue/10 bg-white shadow-sm shadow-ehsNavy/5 transition hover:-translate-y-1 hover:border-ehsBlue/25 hover:shadow-xl hover:shadow-ehsNavy/10">
      <Link href={`/homes/${home.slug}`} aria-label={`View details for ${home.displayName ?? home.name}`} className="block h-full focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/70">
        <div className="relative min-h-56 overflow-hidden bg-ehsSoftBlue sm:min-h-64">
          <HomeImage src={primary?.src} alt={primary?.alt ?? `${home.name} photo`} className="min-h-56 rounded-none transition duration-500 group-hover:scale-105 sm:min-h-64" />
          <span className="absolute right-5 top-5"><StatusBadge status={home.status} /></span>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div>{home.modelNumber && <p className="text-sm font-semibold text-ehsDeepBlue">{home.modelNumber}</p>}<h3 className="mt-1 text-2xl font-black leading-tight text-ehsNavy">{home.displayName ?? home.name}</h3></div>
          <div className="flex flex-wrap gap-2">{homeBadges(home).map((badge) => <span key={badge} className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsDeepBlue">{badge}</span>)}</div>
          <div className="rounded-2xl bg-gradient-to-br from-ehsSoftBlue to-white p-4 ring-1 ring-ehsBlue/10">
            <p className="text-xs font-black uppercase tracking-wide text-ehsNavy/60">{home.priceLabel ?? "Price"}</p>
            <p className="mt-1 text-3xl font-black text-ehsNavy">{formatHomePrice(home)}</p>
            <p className="mt-2 text-xs font-semibold text-ehsNavy/55">Final quote required.</p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-sm" aria-label={`${home.displayName ?? home.name} quick specs`}>{specs.map((spec) => <Spec key={spec.label} {...spec} />)}</dl>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <span className="inline-flex flex-1 justify-center rounded-full bg-ehsBlue px-5 py-3 text-sm font-black text-white transition group-hover:bg-ehsDeepBlue">View Details</span>
            <span className="inline-flex flex-1 justify-center rounded-full border border-ehsBlue/30 bg-white px-5 py-3 text-sm font-black text-ehsDeepBlue">Get Quote</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
function Spec({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-ehsBlue/10 bg-white p-3"><dt className="text-[0.68rem] font-black uppercase tracking-wide text-ehsNavy/55">{label}</dt><dd className="mt-1 break-words text-base font-black text-ehsNavy">{value}</dd></div>; }
