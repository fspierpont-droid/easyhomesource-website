import { LeadForm } from "@/components/LeadForm";
import { getHomeBySlug, homes } from "@/data/homes";

export const metadata = { title: "Contact Easy HomeSource", description: "Request manufactured home pricing or schedule a Brooksville visit." };

export default function ContactPage({ searchParams }: { searchParams?: { home?: string; model?: string } }) {
  const requestedHome = searchParams?.home ? getHomeBySlug(searchParams.home) : undefined;
  const requestedModel = searchParams?.model ? homes.find((home) => home.name === searchParams.model || home.displayName === searchParams.model || home.modelNumber === searchParams.model) : undefined;
  const interestedHome = requestedHome ?? requestedModel;

  return (
    <main className="px-4 py-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-black text-ehsBlue">Contact Easy HomeSource</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack">Get pricing, tour details, and next steps.</h1>
          <p className="mt-4 text-lg leading-8 text-ehsBlack/75">Send a message and the Easy HomeSource team will follow up about available homes, pricing, financing guidance, delivery and setup, permitting, and Brooksville-area next steps.</p>
          <div className="mt-8 rounded-3xl bg-ehsSoftBlue p-6 text-ehsBlack"><p className="font-black">Easy HomeSource</p><address className="mt-2 not-italic">9011 McIntyre Rd<br />Brooksville, FL 34601</address><p className="mt-2">Phone: <a className="font-bold text-ehsBlue hover:text-ehsBlack" href="tel:+13525588888">352-558-8888</a></p></div>
        </div>
        <LeadForm interestedHome={interestedHome?.name} interestedHomeSlug={interestedHome?.slug} cta="Request Pricing" sourcePage="Contact page" />
      </section>
    </main>
  );
}
