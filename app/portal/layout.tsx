import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Easy Home Source Portal | Property Center",
  description: "Production operational hub and single source of truth for Easy Home Source manufactured homes, lots, packages, and inventory."
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
