import type { Metadata } from "next";
import { PropertyManager } from "@/components/PropertyManager";

export const metadata: Metadata = {
  title: "Property Inventory Manager",
  description: "Internal Easy HomeSource property inventory workspace.",
  robots: { index: false, follow: false }
};

export default function PropertyAdminPage() {
  return <PropertyManager />;
}
