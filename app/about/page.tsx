import { ButtonLink } from "@/components/ButtonLink";

export default function AboutPage() {
  return (
    <main className="px-4 py-12">
      <section className="mx-auto max-w-5xl">
        <p className="font-black text-ehsBlue">About Easy HomeSource</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-black text-ehsBlack">A local Brooksville manufactured home dealership focused on practical guidance.</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-ehsBlack/75">Easy HomeSource helps Florida buyers compare manufactured home options, talk through budget and financing questions, and understand what happens after choosing a home. From the first visit through delivery and setup coordination, permitting conversations, and move-in planning, our team aims to make each step easier to follow.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Clear home selection", "Browse starter inventory, ask about current availability, and compare layouts, sizes, options, and timelines with straightforward support."],
            ["Financing conversations", "We help buyers prepare for lender discussions, documentation questions, land-home considerations, and total project cost planning."],
            ["Move-in support", "Our Brooksville team helps coordinate practical next steps such as delivery and setup, site work conversations, inspections, permits, and readiness for move-in."]
          ].map(([title, text]) => <div key={title} className="rounded-3xl bg-ehsSoftBlue p-6"><h2 className="text-xl font-black text-ehsBlack">{title}</h2><p className="mt-3 leading-7 text-ehsBlack/70">{text}</p></div>)}
        </div>
        <div className="mt-8 rounded-[2rem] bg-white p-6 leading-8 text-ehsBlack/75 shadow-sm ring-1 ring-ehsBlack/10">Whether you are shopping for a home only, exploring a land-home path, or trying to understand site preparation before you commit, Easy HomeSource is here to provide clear answers and practical direction without turning this public website into a portal, CRM, or quote system.</div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/get-quote" variant="secondary">Schedule a Tour</ButtonLink></div>
      </section>
    </main>
  );
}
