export type Home = {
  slug: string;
  name: string;
  manufacturer: string;
  price: string;
  beds: number;
  baths: number;
  squareFootage: number;
  size: string;
  status: "Available" | "Coming Soon" | "Model Home";
  featured: boolean;
  imagePlaceholder: string;
  floorplanPlaceholder: string;
  description: string;
  features: string[];
};

export const homes: Home[] = [
  {
    slug: "brooksville-breeze",
    name: "Brooksville Breeze",
    manufacturer: "Champion Homes",
    price: "$129,900",
    beds: 3,
    baths: 2,
    squareFootage: 1456,
    size: "28' x 52'",
    status: "Available",
    featured: true,
    imagePlaceholder: "Warm exterior rendering placeholder",
    floorplanPlaceholder: "Open-concept 3 bed / 2 bath floorplan placeholder",
    description: "A practical family home with an open kitchen, spacious living room, and private primary suite designed for everyday Florida living.",
    features: ["Island kitchen", "Split bedroom layout", "Walk-in primary closet", "Utility room", "Energy-conscious construction"]
  },
  {
    slug: "suncoast-haven",
    name: "Suncoast Haven",
    manufacturer: "Clayton Homes",
    price: "$154,500",
    beds: 4,
    baths: 2,
    squareFootage: 1791,
    size: "28' x 64'",
    status: "Available",
    featured: true,
    imagePlaceholder: "Bright double-wide exterior placeholder",
    floorplanPlaceholder: "Large 4 bed / 2 bath floorplan placeholder",
    description: "Room to grow with four bedrooms, generous storage, and a kitchen built to keep everyone connected.",
    features: ["Four bedrooms", "Large dining area", "Family-size kitchen", "Double vanity bath", "Covered entry option"]
  },
  {
    slug: "cypress-cottage",
    name: "Cypress Cottage",
    manufacturer: "Fleetwood Homes",
    price: "$99,900",
    beds: 2,
    baths: 2,
    squareFootage: 960,
    size: "16' x 60'",
    status: "Model Home",
    featured: false,
    imagePlaceholder: "Compact single-section home placeholder",
    floorplanPlaceholder: "Efficient 2 bed / 2 bath floorplan placeholder",
    description: "An efficient single-section home for buyers who want comfort, simplicity, and an approachable monthly payment.",
    features: ["Efficient footprint", "Two full baths", "Open living area", "Low-maintenance finishes", "Great starter option"]
  },
  {
    slug: "hernando-retreat",
    name: "Hernando Retreat",
    manufacturer: "Live Oak Homes",
    price: "$189,000",
    beds: 3,
    baths: 2,
    squareFootage: 1980,
    size: "32' x 66'",
    status: "Coming Soon",
    featured: true,
    imagePlaceholder: "Premium ranch-style home placeholder",
    floorplanPlaceholder: "Spacious 3 bed / 2 bath retreat floorplan placeholder",
    description: "A larger home with upgraded living spaces, flexible gathering areas, and a primary suite that feels tucked away.",
    features: ["Oversized living room", "Den option", "Deluxe primary suite", "Pantry storage", "Entertainment-ready layout"]
  }
];

export function getFeaturedHomes() {
  return homes.filter((home) => home.featured);
}

export function getHomeBySlug(slug: string) {
  return homes.find((home) => home.slug === slug);
}
