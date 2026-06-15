import Link from "next/link";
import { socialLinks } from "@/data/site";

const labels: Record<keyof typeof socialLinks, string> = {
  youtube: "Easy HomeSource YouTube",
  facebook: "Easy HomeSource Facebook",
  instagram: "Easy HomeSource Instagram",
  x: "Easy HomeSource X",
  tiktok: "Easy HomeSource TikTok"
};

const marks: Record<keyof typeof socialLinks, string> = { youtube: "YT", facebook: "f", instagram: "IG", x: "X", tiktok: "♪" };

export function SocialLinks({ inverse = false }: { inverse?: boolean }) {
  const entries = Object.entries(socialLinks).filter(([, url]) => Boolean(url)) as [keyof typeof socialLinks, string][];
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
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition ${inverse ? "bg-white/10 text-white hover:bg-white/20" : "bg-ehsSoftBlue text-ehsBlue hover:bg-ehsLightBlue/50"}`}
        >
          {marks[key]}
        </Link>
      ))}
    </div>
  );
}
