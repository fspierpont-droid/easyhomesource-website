import { LeadForm } from "@/components/LeadForm";

export default function ContactPage() {
  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1fr]">
        <section>
          <p className="font-black text-clay">Contact</p>
          <h1 className="mt-2 text-4xl font-black text-forest">Ready to talk about your next manufactured home?</h1>
          <p className="mt-4 text-lg leading-8 text-forest/75">Send a message and the Easy HomeSource team will follow up about available homes, pricing, financing guidance, delivery, setup, permitting, and Brooksville-area next steps.</p>
          <div className="mt-8 rounded-3xl bg-sand p-6 text-forest"><p className="font-black">Easy HomeSource</p><address className="mt-2 not-italic">9011 McIntyre Rd<br />Brooksville, FL 34601</address><p className="mt-2">Phone: <a className="font-bold text-clay hover:text-forest" href="tel:+13525588888">352-558-8888</a></p></div>
        </section>
        <LeadForm cta="Request Info" />
      </div>
    </main>
  );
}
