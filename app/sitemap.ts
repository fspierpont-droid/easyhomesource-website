import type { MetadataRoute } from "next";
import { homes } from "@/data/homes";
const baseUrl = "https://easyhomesource.com";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/homes", "/featured-homes", "/special-offers", "/financing", "/delivery-setup", "/how-it-works", "/contact"];
  return [...routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() })), ...homes.map((home) => ({ url: `${baseUrl}/homes/${home.id}`, lastModified: new Date() }))];
}
