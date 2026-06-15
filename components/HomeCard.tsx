import Link from "next/link";
import type { Home, HomeStatus } from "@/data/homes";

const statusStyles: Record<HomeStatus, string> = { Available: "bg-ehsLightBlue/60 text-ehsBlack ring-ehsBlue/20", "Coming Soon": "bg-ehsMediumBlue/25 text-ehsBlack ring-ehsMediumBlue/20", Sold: "bg-borderGray text-ehsBlack ring-ehsBlack/10" };
export function StatusBadge({ status }: { status: HomeStatus }) { return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}>{status}</span>; }
export function homeBadges(home: Home) { return [home.featured && "Featured", home.onDisplay && "On Display", home.newArrival && "New Arrival", home.specialOffer && "Special Offer"].filter(Boolean) as string[]; }

export function HomeCard({ home }: { home: Home }) {
  const badges = homeBadges(home);
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-borderGray bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative min-h-52 bg-gradient-to-br from-ehsBlack via-ehsBlack to-ehsBlue p-5 text-white">
        <div className="absolute inset-x-5 bottom-5 rounded-3xl bg-white/15 p-5 backdrop-blur"><p className="text-sm font-bold uppercase tracking-wide text-white/75">{home.manufacturer ?? "Easy HomeSource inventory"}</p><p className="mt-1 text-xl font-black">{home.size ?? "Details being finalized"}</p></div>
        <span className="absolute right-5 top-5"><StatusBadge status={home.status} /></span>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div><p className="text-sm font-semibold text-ehsBlue">{home.manufacturer ?? "Manufacturer being finalized"}</p><h3 className="mt-1 text-2xl font-black text-ehsBlack">{home.name}</h3></div>
        <div className="flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsBlack">{badge}</span>)}</div>
        <div className="rounded-2xl bg-ehsSoftBlue/70 p-4"><p className="text-xs font-black uppercase tracking-wide text-ehsBlack/60">{home.priceLabel ?? "Starting price"}</p><p className="mt-1 text-3xl font-black text-ehsBlack">{home.price ?? "Call for current pricing"}</p></div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><Spec label="Beds" value={home.beds ?? "TBD"} /><Spec label="Baths" value={home.baths ?? "TBD"} /><Spec label="Sq. Ft." value={home.squareFeet ? home.squareFeet.toLocaleString() : "TBD"} /><Spec label="Size" value={home.size ?? "TBD"} /></dl>
        <div className="flex flex-col gap-3 sm:flex-row"><Link className="inline-flex justify-center rounded-full bg-ehsBlue px-5 py-3 text-sm font-black text-white transition hover:bg-ehsMediumBlue" href={`/homes/${home.id}`}>View Details</Link><Link className="inline-flex justify-center rounded-full border border-ehsBlue px-5 py-3 text-sm font-black text-ehsBlue transition hover:bg-ehsSoftBlue" href={`/homes/${home.id}#lead-form`}>Get Pricing</Link></div>
      </div>
    </article>
  );
}
function Spec({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-borderGray p-3"><dt className="font-black text-ehsBlack">{label}</dt><dd className="mt-1 text-ehsBlack/70">{value}</dd></div>; }
