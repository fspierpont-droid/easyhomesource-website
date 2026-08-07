import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Easy Home Source Portal | Property Center",
  description: "Production operational hub and single source of truth for Easy Home Source manufactured homes, lots, packages, and inventory."
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex">
      {children}
    </div>
  );
}
