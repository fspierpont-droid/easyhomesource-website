import type { Metadata } from "next";
import { PropertyInventory } from "@/components/PropertyInventory";

export const metadata: Metadata = {
  title: "Property Map & Availability",
  description: "View Easy HomeSource finished homes, vacant land, multi-site opportunities, homes in progress, and current sales status across Central Florida."
};

export default function PropertiesPage() {
  return <PropertyInventory />;
}
