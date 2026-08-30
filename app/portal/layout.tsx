import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalAuthBoundary } from "@/components/portal/PortalAuthBoundary";

export const metadata: Metadata = {
  title: "Easy Home Source Portal | Operations",
  description: "Production operational hub and single source of truth for Easy Home Source manufactured homes, quotes, projects, permitting, properties, and inventory."
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalAuthBoundary>{children}</PortalAuthBoundary>;
}
