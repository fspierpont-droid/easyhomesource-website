import { ButtonLink } from "@/components/ButtonLink";

export default function AboutPage() {
  return (
    <main className="px-4 py-12">
      <section className="mx-auto max-w-5xl">
        <p className="font-black text-clay">About Easy HomeSource</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-black text-forest">A Brooksville manufactured home dealership built around clarity.</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-forest/75">Easy HomeSource helps buyers across Florida compare manufactured homes, understand pricing, plan financing conversations, and prepare for the practical steps between selecting a home and moving in.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Clear pricing", "Starting prices and home details are presented in plain language."],
            ["Florida-focused support", "Guidance for land, delivery, setup, permitting, and move-in steps."],
            ["Helpful shopping experience", "A public website focused on homes, questions, and next steps."]
          ].map(([title, text]) => <div key={title} className="rounded-3xl bg-sand p-6"><h2 className="text-xl font-black text-forest">{title}</h2><p className="mt-3 leading-7 text-forest/70">{text}</p></div>)}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/homes">View Available Homes</ButtonLink><ButtonLink href="/contact" variant="secondary">Schedule a Tour</ButtonLink></div>
      </section>
    </main>
  );
}
