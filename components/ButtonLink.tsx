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
      ? "bg-ehsBlue text-white hover:bg-ehsMediumBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60"
      : "border border-ehsBlue bg-white text-ehsBlue hover:bg-ehsSoftBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60";

  return (
    <Link className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${classes}`} href={href}>
      {children}
    </Link>
  );
}
