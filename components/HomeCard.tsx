import Link from "next/link";
import type { Home, HomeStatus } from "@/data/homes";
import { formatHomePrice } from "@/data/homes";
import { HomeImage } from "@/components/HomeImage";

const statusStyles: Record<HomeStatus, string> = {
  Available: "bg-ehsLightBlue/80 text-ehsNavy ring-ehsBlue/20",
  "Coming Soon": "bg-ehsMediumBlue/25 text-ehsNavy ring-ehsMediumBlue/20",
  Sold: "bg-borderGray text-ehsBlack ring-ehsBlack/10"
};

export function StatusBadge({ status }: { status: HomeStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-black ring-1 shadow-sm ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

export function homeBadges(home: Home) {
  return [
    home.isFeatured && "Featured",
    home.isOnDisplay && "On Display",
    home.isCatalogModel && "Online Catalog",
    home.isSpecialOffer && "Special Offer",
    home.isNewArrival && "New Arrival",
    home.isComingSoon && "Coming Soon"
  ].filter(Boolean) as string[];
}

export function HomeCard({ home }: { home: Home }) {
  const primary = home.gallery.find((item) => item.isPrimary) ?? home.gallery[0];
  const detailsHref = `/homes/${home.slug}`;
  const quoteHref = `/get-quote?home=${encodeURIComponent(home.slug)}`;
  const specs = [
    home.bedrooms != null && home.bedrooms > 0 && { label: "Beds", value: home.bedrooms },
    home.bathrooms != null && home.bathrooms > 0 && { label: "Baths", value: home.bathrooms },
    home.squareFeet != null && home.squareFeet > 0 && { label: "Sq. Ft.", value: home.squareFeet.toLocaleString() }
  ].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ehsBlue/10 bg-white shadow-sm shadow-ehsNavy/5 transition duration-200 hover:-translate-y-0.5 hover:border-ehsBlue/30 hover:shadow-md">
      <div>
        {/* Card Image */}
        <Link
          href={detailsHref}
          aria-label={`View details for ${home.displayName ?? home.name}`}
          className="block focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/70"
        >
          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-ehsSoftBlue">
            <HomeImage
              src={primary?.src}
              alt={primary?.alt ?? `${home.name} photo`}
              className="h-full w-full rounded-none transition duration-500 group-hover:scale-105"
              placeholderTitle="Photos coming soon"
            />
            <span className="absolute right-3 top-3">
              <StatusBadge status={home.status} />
            </span>
          </div>
        </Link>

        {/* Content Body */}
        <div className="space-y-3 p-4 sm:p-5">
          <div>
            {home.modelNumber && (
              <p className="text-xs font-semibold text-ehsDeepBlue">{home.modelNumber}</p>
            )}
            <h3 className="mt-0.5 text-lg sm:text-xl font-black leading-snug text-ehsNavy">
              <Link href={detailsHref} className="hover:text-ehsBlue transition-colors">
                {home.displayName ?? home.name}
              </Link>
            </h3>
          </div>

          {/* Badge chips */}
          <div className="flex flex-wrap gap-1.5">
            {homeBadges(home).slice(0, 3).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-ehsSoftBlue px-2.5 py-0.5 text-[10px] font-bold text-ehsDeepBlue"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Pricing Box */}
          <div className="rounded-xl bg-gradient-to-br from-ehsSoftBlue to-white p-3 ring-1 ring-ehsBlue/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ehsNavy/60">
              Display price
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-ehsNavy">
              {formatHomePrice(home)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-ehsNavy/55">
              Final quote required.
            </p>
          </div>

          {/* Quick Specs */}
          {specs.length ? (
            <dl
              className={`grid gap-1.5 text-sm ${
                specs.length === 1
                  ? "grid-cols-1"
                  : specs.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
              aria-label={`${home.displayName ?? home.name} quick specs`}
            >
              {specs.map((spec) => (
                <Spec key={spec.label} {...spec} />
              ))}
            </dl>
          ) : (
            <p className="rounded-xl border border-ehsBlue/10 bg-ehsSoftBlue p-2.5 text-center text-xs font-bold text-ehsNavy/70">
              Ask us for specs
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Link
            className="inline-flex justify-center rounded-xl bg-ehsBlue px-3 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-ehsDeepBlue text-center shadow-sm"
            href={detailsHref}
          >
            View Details
          </Link>
          <Link
            className="inline-flex justify-center rounded-xl border border-ehsBlue/30 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-ehsDeepBlue transition hover:bg-ehsSoftBlue text-center"
            href={quoteHref}
          >
            Get Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-ehsBlue/10 bg-white p-2 text-center">
      <dt className="text-[9px] font-bold uppercase tracking-wider text-ehsNavy/55">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-xs sm:text-sm font-black text-ehsNavy">
        {value}
      </dd>
    </div>
  );
}
