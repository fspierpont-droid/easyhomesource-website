import { GhlLeadForm } from "@/components/GhlLeadForm";
import { getHomeBySlug, homes } from "@/data/homes";
import { siteInfo } from "@/data/site";
import { getPropertyById, formatPropertyAddress } from "@/lib/db/propertyStore";

export const metadata = {
  title: "Get a Quote | Easy HomeSource",
  description: "Request manufactured home pricing, availability, financing guidance, or a Brooksville tour from Easy HomeSource."
};

const approvedGhlFormUrl = "https://links.framelitmedia.com/widget/form/rdWwyO5p9cn3CTEQlmAG";

type GetQuoteSearchParams = {
  home?: string;
  model?: string;
  property?: string;
  source?: string;
  cta?: string;
};

export default async function GetQuotePage({ searchParams }: { searchParams?: GetQuoteSearchParams }) {
  const requestedHome = searchParams?.home ? getHomeBySlug(searchParams.home) : undefined;
  const requestedModel = searchParams?.model ? homes.find((home) => home.name === searchParams.model || home.displayName === searchParams.model || home.modelNumber === searchParams.model) : undefined;
  const interestedHome = requestedHome ?? requestedModel;
  const interestedProperty = searchParams?.property ? getPropertyById(searchParams.property) : undefined;
  const interestedPropertyAddress = interestedProperty ? formatPropertyAddress(interestedProperty) : undefined;
  const isFinancingInquiry = searchParams?.source === "financing";

  return (
    <main className="px-4 py-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-black text-ehsBlue">Get a Quote</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack">Tell us what you need for your next home.</h1>
          <p className="mt-4 text-lg leading-8 text-ehsBlack/75">This is the main place to request current pricing, home availability, a tour, financing guidance, or help planning delivery and setup. Share a few details and the Easy HomeSource team will follow up with the right next step.</p>
          {interestedHome && <p className="mt-6 rounded-2xl border border-ehsBlue/20 bg-white p-4 text-lg font-black text-ehsDeepBlue">You’re requesting pricing for: {interestedHome.displayName ?? interestedHome.name}</p>}
          {interestedProperty && <p className="mt-6 rounded-2xl border border-ehsBlue/20 bg-white p-4 text-lg font-black text-ehsDeepBlue">You’re asking about: {interestedPropertyAddress}</p>}
          {isFinancingInquiry && <p className="mt-6 rounded-2xl border border-ehsBlue/20 bg-white p-4 text-lg font-black text-ehsDeepBlue">You’re asking about financing options.</p>}
          <div className="mt-8 rounded-3xl bg-ehsSoftBlue p-6 text-ehsBlack">
            <p className="font-black">Prefer to talk now?</p>
            <p className="mt-2 leading-7">Call or text <a className="font-black text-ehsBlue hover:text-ehsBlack" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a>, or email <a className="font-black text-ehsBlue hover:text-ehsBlack" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>.</p>
          </div>
        </div>
        <GhlLeadForm
          formUrl={approvedGhlFormUrl}
          homeSlug={interestedHome?.slug ?? searchParams?.home}
          propertyId={interestedProperty?.id ?? searchParams?.property}
          propertyAddress={interestedPropertyAddress}
          source={searchParams?.source ?? (interestedProperty ? "land-home-packages" : "website")}
          cta={searchParams?.cta}
        />
      </section>
    </main>
  );
}
