import { LeadForm } from "@/components/LeadForm";
import { getHomeBySlug, homes } from "@/data/homes";
import { siteInfo } from "@/data/site";

export const metadata = {
  title: "Get a Quote | Easy HomeSource",
  description: "Request manufactured home pricing, availability, financing guidance, or a Brooksville tour from Easy HomeSource."
};

export default function GetQuotePage({ searchParams }: { searchParams?: { home?: string; model?: string } }) {
  const requestedHome = searchParams?.home ? getHomeBySlug(searchParams.home) : undefined;
  const requestedModel = searchParams?.model ? homes.find((home) => home.name === searchParams.model || home.displayName === searchParams.model || home.modelNumber === searchParams.model) : undefined;
  const interestedHome = requestedHome ?? requestedModel;

  return (
    <main className="px-4 py-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-black text-ehsBlue">Get a Quote</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack">Tell us what you need for your next home.</h1>
          <p className="mt-4 text-lg leading-8 text-ehsBlack/75">This is the main place to request current pricing, home availability, a tour, financing guidance, or help planning delivery and setup. Share a few details and the Easy HomeSource team will follow up with the right next step.</p>
          <div className="mt-8 rounded-3xl bg-ehsSoftBlue p-6 text-ehsBlack">
            <p className="font-black">Prefer to talk now?</p>
            <p className="mt-2 leading-7">Call or text <a className="font-black text-ehsBlue hover:text-ehsBlack" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a>, or email <a className="font-black text-ehsBlue hover:text-ehsBlack" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>.</p>
          </div>
        </div>
        <LeadForm interestedHome={interestedHome?.name} interestedHomeSlug={interestedHome?.slug} cta="Request Info" sourcePage="Get quote page" />
      </section>
    </main>
  );
}
