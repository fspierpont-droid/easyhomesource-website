import Link from "next/link";

const consentLanguage = "By submitting this form, you agree that Easy HomeSource may contact you by phone, text, or email about your inquiry. Message and data rates may apply. Reply STOP to opt out.";

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
    <div className="min-w-0 overflow-hidden rounded-[2rem] border border-ehsBlue/15 bg-white shadow-xl shadow-ehsBlack/5">
      <div className="border-b border-ehsBlue/10 bg-gradient-to-r from-ehsSoftBlue to-white px-5 py-5 sm:px-8">
        <p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Easy HomeSource</p>
        <h2 className="mt-1 text-3xl font-black text-ehsBlack">Request pricing</h2>
      </div>
      <iframe
        className="block h-[920px] w-full max-w-full border-0 sm:h-[840px]"
        src={url.toString()}
        title="Easy HomeSource pricing request form"
        loading="eager"
      />
      <div className="border-t border-ehsBlue/10 bg-ehsSoftBlue/40 px-5 py-5 text-xs font-semibold leading-6 text-ehsBlack/70 sm:px-8">
        <p>{consentLanguage}</p>
        <p className="mt-2">
          Review our <Link className="font-black text-ehsBlue underline" href="/privacy">Privacy Policy</Link> and{" "}
          <Link className="font-black text-ehsBlue underline" href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </div>
  );
}
