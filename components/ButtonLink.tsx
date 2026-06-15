import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const classes =
    variant === "primary"
      ? "bg-clay text-white hover:bg-clay/90"
      : "border border-forest/20 bg-white text-forest hover:border-forest/50";

  return (
    <Link className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${classes}`} href={href}>
      {children}
    </Link>
  );
}
