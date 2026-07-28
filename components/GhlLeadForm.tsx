import Link from "next/link";

type GhlLeadFormProps = {
  formUrl: string;
  homeSlug?: string;
  source?: string;
  cta?: string;
};

export function GhlLeadForm({ formUrl, homeSlug, source = "website", cta }: GhlLeadFormProps) {
  const url = new URL(formUrl);
  if (homeSlug) url.searchParams.set("home", homeSlug);
  if (source) url.searchParams.set("source", source);
  if (cta) url.searchParams.set("cta", cta);

  return (
    <div className="mx-auto min-w-0 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-ehsBlue/15 bg-white shadow-xl shadow-ehsBlack/5">
      <div className="border-b border-ehsBlue/10 px-5 py-6 sm:px-8 sm:py-7">
        <h2 className="text-2xl font-black text-ehsBlack sm:text-3xl">Tell us what you’re looking for</h2>
        <p className="mt-3 leading-7 text-ehsBlack/70">Send your details and the Easy HomeSource team will follow up about homes, pricing, financing, delivery, setup, and next steps.</p>
      </div>
      {/* Inner field styling is controlled in GoHighLevel Form Builder. */}
      <iframe
        className="block h-[1050px] min-h-[1050px] w-full max-w-full border-0 sm:h-[980px] sm:min-h-[980px]"
        src={url.toString()}
        title="Easy HomeSource pricing request form"
        loading="eager"
      />
      <div className="border-t border-ehsBlue/10 bg-ehsSoftBlue/40 px-5 py-4 text-center text-xs font-semibold leading-6 text-ehsBlack/70 sm:px-8">
        <p>
          Review our <Link className="font-black text-ehsBlue underline" href="/privacy">Privacy Policy</Link> and{" "}
          <Link className="font-black text-ehsBlue underline" href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </div>
  );
}
