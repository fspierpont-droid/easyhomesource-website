import type { Metadata } from "next";
import { PropertyInventory } from "@/components/PropertyInventory";

export const metadata: Metadata = {
  title: "Land & Home Packages | Easy HomeSource",
  description: "Explore Easy HomeSource land and home package opportunities, completed homes, build-ready properties, multi-site land, and homes coming soon across Central Florida."
};

export default function PropertiesPage() {
  return <PropertyInventory />;
}
