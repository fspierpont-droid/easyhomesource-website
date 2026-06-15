import Link from "next/link";
import { socialLinks } from "@/data/site";

const labels: Record<keyof typeof socialLinks, string> = {
  youtube: "Easy HomeSource YouTube",
  facebook: "Easy HomeSource Facebook",
  instagram: "Easy HomeSource Instagram",
  x: "Easy HomeSource X",
  tiktok: "Easy HomeSource TikTok"
};

function Icon({ name }: { name: keyof typeof socialLinks }) {
  const iconClass = "h-4 w-4";

  switch (name) {
    case "youtube":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M18.2 2h3.4l-7.5 8.6L23 22h-7l-5.5-7.1L4.2 22H.8l8-9.2L.2 2h7.2l5 6.6L18.2 2Zm-1.2 18h1.9L6.4 3.9h-2L17 20Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M16.6 2c.3 2.3 1.6 3.8 3.9 3.9v3.4a7 7 0 0 1-3.8-1.1v7.1c0 3.6-2.3 6.7-6.4 6.7a6.2 6.2 0 0 1-6.3-6.1c0-3.8 3-6.5 6.8-6.2v3.6c-1.7-.3-3.1.8-3.1 2.5 0 1.5 1.1 2.6 2.6 2.6 1.7 0 2.7-1 2.7-3.2V2h3.6Z" />
        </svg>
      );
  }
}

export function SocialLinks({ inverse = false }: { inverse?: boolean }) {
  const entries = Object.entries(socialLinks).filter(([, url]) => Boolean(url) && url !== "#") as [keyof typeof socialLinks, string][];
  if (!entries.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Easy HomeSource social links">
      {entries.map(([key, url]) => (
        <Link
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels[key]}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60 ${inverse ? "bg-white/10 text-white hover:bg-white/20" : "bg-ehsSoftBlue text-ehsBlue hover:bg-ehsLightBlue/50"}`}
        >
          <Icon name={key} />
        </Link>
      ))}
    </div>
  );
}
