"use client";

import { useMemo, useState } from "react";
import { HomeCard } from "@/components/HomeCard";
import type { Home } from "@/data/homes";

type Sort = "featured" | "price-asc" | "price-desc" | "sqft-desc" | "sqft-asc" | "beds-desc" | "beds-asc";
type FlagKey = "featured" | "onDisplay" | "catalogModel" | "specialOffer" | "newArrival";

const priceNumber = (home: Home) => home.salePrice ?? home.startingPrice ?? Number.POSITIVE_INFINITY;
const flagLabels: { key: FlagKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "onDisplay", label: "On Display" },
  { key: "catalogModel", label: "Online Catalog" },
  { key: "specialOffer", label: "Special Offer" },
  { key: "newArrival", label: "New Arrival" }
];

export function HomesBrowser({ homes }: { homes: Home[] }) {
  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");
  const [bathrooms, setBathrooms] = useState("Any");
  const [priceMax, setPriceMax] = useState("Any");
  const [sqftMin, setSqftMin] = useState("Any");
  const [manufacturer, setManufacturer] = useState("Any");
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>({
    featured: false,
    onDisplay: false,
    catalogModel: false,
    newArrival: false,
    specialOffer: false
  });

  const manufacturers = useMemo(() => {
    const names: string[] = [];
    homes.forEach((home) => {
      if (home.manufacturer && !names.includes(home.manufacturer)) names.push(home.manufacturer);
    });
    return ["Any", ...names.sort()];
  }, [homes]);

  const isFiltered =
    Boolean(search.trim()) ||
    bedrooms !== "Any" ||
    bathrooms !== "Any" ||
    priceMax !== "Any" ||
    sqftMin !== "Any" ||
    manufacturer !== "Any" ||
    Object.values(flags).some(Boolean);

  const filteredHomes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = homes.filter((home) => {
      const searchable = [
        home.name,
        home.displayName,
        home.alternateName,
        home.modelNumber,
        home.manufacturer,
        home.series,
        home.size
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const price = priceNumber(home);
      return (
        (!q || searchable.includes(q)) &&
        (bedrooms === "Any" || (home.bedrooms != null && home.bedrooms >= Number(bedrooms))) &&
        (bathrooms === "Any" || (home.bathrooms != null && home.bathrooms >= Number(bathrooms))) &&
        (priceMax === "Any" || price <= Number(priceMax)) &&
        (sqftMin === "Any" || (home.squareFeet != null && home.squareFeet >= Number(sqftMin))) &&
        (manufacturer === "Any" || home.manufacturer === manufacturer) &&
        (!flags.featured || home.isFeatured) &&
        (!flags.onDisplay || home.isOnDisplay) &&
        (!flags.catalogModel || home.isCatalogModel) &&
        (!flags.specialOffer || home.isSpecialOffer) &&
        (!flags.newArrival || home.isNewArrival)
      );
    });

    return list.sort((a, b) => {
      if (sort === "featured")
        return (
          Number(b.isFeatured) - Number(a.isFeatured) ||
          Number(b.isSpecialOffer) - Number(a.isSpecialOffer) ||
          Number(b.isOnDisplay) - Number(a.isOnDisplay) ||
          Number(a.isCatalogModel) - Number(b.isCatalogModel) ||
          priceNumber(a) - priceNumber(b)
        );
      if (sort === "price-asc") return priceNumber(a) - priceNumber(b);
      if (sort === "price-desc") return priceNumber(b) - priceNumber(a);
      if (sort === "sqft-asc")
        return (a.squareFeet ?? Number.POSITIVE_INFINITY) - (b.squareFeet ?? Number.POSITIVE_INFINITY);
      if (sort === "sqft-desc") return (b.squareFeet ?? 0) - (a.squareFeet ?? 0);
      if (sort === "beds-asc")
        return (a.bedrooms ?? Number.POSITIVE_INFINITY) - (b.bedrooms ?? Number.POSITIVE_INFINITY);
      return (b.bedrooms ?? 0) - (a.bedrooms ?? 0);
    });
  }, [bathrooms, bedrooms, flags, homes, manufacturer, priceMax, search, sort, sqftMin]);

  const clearFilters = () => {
    setSearch("");
    setBedrooms("Any");
    setBathrooms("Any");
    setPriceMax("Any");
    setSqftMin("Any");
    setManufacturer("Any");
    setFlags({
      featured: false,
      onDisplay: false,
      catalogModel: false,
      newArrival: false,
      specialOffer: false
    });
    setSort("featured");
  };

  return (
    <section className="mt-8">
      {/* Filter Box */}
      <div className="rounded-2xl border border-borderGray bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Shop homes</p>
            <h2 className="mt-0.5 text-xl font-black text-ehsBlack">Find the right model faster</h2>
            <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-ehsBlack/65">
              Filter by budget, beds, baths, size, manufacturer, display homes, and online catalog models.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="rounded-full border border-ehsBlue px-4 py-2 text-xs font-black text-ehsBlue hover:bg-ehsSoftBlue transition-colors"
            >
              {filtersOpen ? "Hide Filters" : "Filter Homes"}
            </button>
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-ehsSoftBlue px-4 py-2 text-xs font-black text-ehsBlack hover:bg-ehsLightBlue/60 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Controls */}
        <div
          className={`${
            filtersOpen ? "grid" : "hidden"
          } mt-5 gap-3 sm:gap-4 lg:grid lg:grid-cols-12 lg:items-end border-t border-borderGray/60 pt-4`}
        >
          <label className="text-xs font-black text-ehsBlack lg:col-span-4">
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, model, size..."
              className="mt-1 w-full rounded-xl border border-borderGray bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-ehsBlack outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/50"
            />
          </label>
          <Select
            label="Beds"
            value={bedrooms}
            setValue={setBedrooms}
            options={["Any", "1", "2", "3", "4", "5"]}
            suffix="+ beds"
            className="lg:col-span-2"
          />
          <Select
            label="Baths"
            value={bathrooms}
            setValue={setBathrooms}
            options={["Any", "1", "2", "3"]}
            suffix="+ baths"
            className="lg:col-span-2"
          />
          <Select
            label="Max Price"
            value={priceMax}
            setValue={setPriceMax}
            options={["Any", "75000", "100000", "125000", "150000", "200000"]}
            suffix=" max"
            money
            className="lg:col-span-2"
          />
          <Select
            label="Min Sq. Ft."
            value={sqftMin}
            setValue={setSqftMin}
            options={["Any", "750", "1000", "1400", "1800"]}
            suffix="+ sq. ft."
            className="lg:col-span-2"
          />
          <Select
            label="Manufacturer"
            value={manufacturer}
            setValue={setManufacturer}
            options={manufacturers}
            suffix=""
            className="lg:col-span-4"
          />
          <label className="text-xs font-black text-ehsBlack lg:col-span-4">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="mt-1 w-full rounded-xl border border-borderGray bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-ehsBlack outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/50"
            >
              <option value="featured">Display homes first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="sqft-desc">Square footage: high to low</option>
              <option value="sqft-asc">Square footage: low to high</option>
              <option value="beds-desc">Bedrooms: high to low</option>
              <option value="beds-asc">Bedrooms: low to high</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-1.5 lg:col-span-4">
            {flagLabels.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFlags((value) => ({ ...value, [key]: !value[key] }))}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  flags[key]
                    ? "bg-ehsBlue text-white"
                    : "bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex flex-col gap-2 border-t border-borderGray/60 pt-3 text-xs font-bold text-ehsBlack/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing <span className="text-ehsBlue font-black">{filteredHomes.length}</span> of {homes.length} homes
          </p>
          <p className="text-[11px] text-ehsBlack/50">{isFiltered ? "Filters active" : "No filters active"}</p>
        </div>
      </div>

      {/* Homes Grid (Clean 3-4 Column Grid) */}
      {filteredHomes.length ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {filteredHomes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-borderGray bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-ehsBlack">No homes match those filters.</h3>
          <p className="mt-2 text-xs sm:text-sm text-ehsBlack/70">
            Clear the filters or contact Easy HomeSource and we can help find the closest match.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-full bg-ehsBlue px-5 py-2.5 text-xs font-black text-white hover:bg-ehsDeepBlue transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
  suffix,
  money = false,
  className = ""
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  suffix: string;
  money?: boolean;
  className?: string;
}) {
  return (
    <label className={`text-xs font-black text-ehsBlack ${className}`}>
      {label}
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 w-full rounded-xl border border-borderGray bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-ehsBlack outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "Any" ? "Any" : `${money ? "$" + Number(option).toLocaleString() : option}${suffix}`}
          </option>
        ))}
      </select>
    </label>
  );
}
