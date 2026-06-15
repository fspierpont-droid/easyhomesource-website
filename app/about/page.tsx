import { ButtonLink } from "@/components/ButtonLink";

export default function AboutPage() {
  return (
    <main className="px-4 py-12">
      <section className="mx-auto max-w-4xl">
        <p className="font-bold text-clay">About Easy HomeSource</p>
        <h1 className="mt-2 text-4xl font-black text-forest">A public home-shopping experience built around clarity</h1>
        <p className="mt-6 text-lg leading-8 text-forest/75">Easy HomeSource is a manufactured home dealership in Brooksville, Florida focused on helping buyers compare homes, understand pricing, and move confidently from first conversation to move-in.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {['Clear home information', 'Friendly financing guidance', 'Florida buyer support'].map((value) => <div key={value} className="rounded-3xl bg-sand p-6 text-xl font-black text-forest">{value}</div>)}
        </div>
        <div className="mt-8"><ButtonLink href="/contact">Contact our team</ButtonLink></div>
      </section>
    </main>
  );
}
