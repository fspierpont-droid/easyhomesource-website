export type HomeStatus = "Available" | "Coming Soon" | "Sold";

export type Home = {
  slug: string;
  name: string;
  series: string;
  manufacturer: string;
  price: string;
  beds: number;
  baths: number;
  squareFootage: number;
  size: string;
  status: HomeStatus;
  featured: boolean;
  visualDescription: string;
  floorplanDescription: string;
  description: string;
  features: string[];
};

export const homes: Home[] = [
  {
    slug: "brooksville-breeze",
    name: "Brooksville Breeze",
    series: "Family Series",
    manufacturer: "Champion Homes",
    price: "$129,900",
    beds: 3,
    baths: 2,
    squareFootage: 1456,
    size: "28' x 52'",
    status: "Available",
    featured: true,
    visualDescription: "Double-section home with covered entry option",
    floorplanDescription: "Open living, island kitchen, split-bedroom layout, and utility room.",
    description: "A practical three-bedroom home with an open kitchen, comfortable living room, and a private primary suite designed for everyday Florida living.",
    features: ["Island kitchen", "Split-bedroom layout", "Walk-in primary closet", "Utility room", "Energy-conscious construction"]
  },
  {
    slug: "suncoast-haven",
    name: "Suncoast Haven",
    series: "Family Series",
    manufacturer: "Clayton Homes",
    price: "$154,500",
    beds: 4,
    baths: 2,
    squareFootage: 1791,
    size: "28' x 64'",
    status: "Available",
    featured: true,
    visualDescription: "Four-bedroom double-section home",
    floorplanDescription: "Large gathering area, central kitchen, four bedrooms, and two full baths.",
    description: "Room to grow with four bedrooms, generous storage, and a kitchen built to keep family, guests, and daily routines connected.",
    features: ["Four bedrooms", "Large dining area", "Family-size kitchen", "Double vanity bath", "Covered entry option"]
  },
  {
    slug: "cypress-cottage",
    name: "Cypress Cottage",
    series: "Value Series",
    manufacturer: "Fleetwood Homes",
    price: "$99,900",
    beds: 2,
    baths: 2,
    squareFootage: 960,
    size: "16' x 60'",
    status: "Sold",
    featured: false,
    visualDescription: "Efficient single-section home",
    floorplanDescription: "Two-bedroom plan with open living space and two full baths.",
    description: "An efficient single-section home for buyers who want comfort, simplicity, and an approachable path into manufactured home ownership.",
    features: ["Efficient footprint", "Two full baths", "Open living area", "Low-maintenance finishes", "Great starter option"]
  },
  {
    slug: "hernando-retreat",
    name: "Hernando Retreat",
    series: "Premier Series",
    manufacturer: "Live Oak Homes",
    price: "$189,000",
    beds: 3,
    baths: 2,
    squareFootage: 1980,
    size: "32' x 66'",
    status: "Coming Soon",
    featured: true,
    visualDescription: "Spacious ranch-style manufactured home",
    floorplanDescription: "Oversized living room, den option, pantry storage, and private primary suite.",
    description: "A larger home with upgraded living spaces, flexible gathering areas, and a primary suite that feels tucked away from the main living area.",
    features: ["Oversized living room", "Den option", "Deluxe primary suite", "Pantry storage", "Entertainment-ready layout"]
  }
];

export function getFeaturedHomes() {
  return homes.filter((home) => home.featured);
}

export function getHomeBySlug(slug: string) {
  return homes.find((home) => home.slug === slug);
}
