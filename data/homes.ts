export type HomeStatus = "Available" | "Coming Soon" | "Sold";

export type Home = {
  id: string;
  name: string;
  manufacturer: string | null;
  price: string | null;
  priceLabel?: string;
  startingPrice?: number | null;
  beds: number | null;
  baths: number | null;
  squareFeet: number | null;
  size: string | null;
  width?: string | null;
  length?: string | null;
  status: HomeStatus;
  featured: boolean;
  onDisplay: boolean;
  newArrival: boolean;
  specialOffer: boolean;
  locationOnLot: string | null;
  mainImage: string | null;
  floorplanImage: string | null;
  description: string;
  longDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  features: string[];
  notes: string;
  needsVerification: boolean;
};

const defaultDescription = "A starter Easy HomeSource inventory placeholder. Contact the Brooksville team for current availability, verified specifications, options, and next steps.";
const defaultFeatures = ["Manufactured home", "Brooksville-area dealership support", "Financing conversation available", "Delivery and setup coordination guidance"];

export const homes: Home[] = [
  {
    id: "tulip",
    name: "The Tulip",
    manufacturer: null, // TODO: confirm manufacturer
    price: "$39,888",
    priceLabel: "Starting Price",
    startingPrice: 39888,
    beds: 1,
    baths: 1,
    squareFeet: 480,
    size: "12' x 40'",
    width: "12'",
    length: "40'",
    status: "Coming Soon",
    featured: true,
    onDisplay: false,
    newArrival: false,
    specialOffer: true,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: "An affordable compact manufactured home option for buyers looking for a practical path toward homeownership.",
    longDescription: "The Tulip is a compact, budget-friendly home option designed for buyers who want a simple and affordable way to start the path toward homeownership. Ask Easy HomeSource about current availability, financing options, delivery, setup, and final quote details.",
    seoTitle: "The Tulip Manufactured Home Starting at $39,888 | Easy HomeSource",
    seoDescription: "Explore The Tulip, a compact manufactured home starting at $39,888 from Easy HomeSource in Brooksville, Florida. Ask about availability, financing options, delivery, setup, and final quote details.",
    features: defaultFeatures,
    notes: "The Tulip special-offer listing. Home availability, pricing, financing, delivery, setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.",
    needsVerification: false
  },
  {
    id: "paxton",
    name: "Paxton",
    manufacturer: null, // TODO: confirm manufacturer
    price: "$158,888",
    priceLabel: "Starting Price",
    startingPrice: 158888,
    beds: 3,
    baths: 2,
    squareFeet: 1394,
    size: "26' 8\" x 52'",
    width: "26' 8\"",
    length: "52'",
    status: "Coming Soon",
    featured: true,
    onDisplay: true,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: "A spacious 3 bedroom, 2 bathroom manufactured home with an open layout and room for everyday living.",
    longDescription: "The Paxton is a spacious manufactured home with 3 bedrooms, 2 bathrooms, and approximately 1,394 square feet. It is a strong option for buyers looking for a larger layout with comfortable living space, practical design, and support from Easy HomeSource through pricing, financing guidance, delivery, and setup.",
    seoTitle: "Paxton Manufactured Home | Easy HomeSource",
    seoDescription: "Explore the Paxton manufactured home from Easy HomeSource, a spacious 3 bedroom, 2 bathroom home with approximately 1,394 square feet. Ask about pricing, financing options, delivery, setup, and availability.",
    features: defaultFeatures,
    notes: "Paxton listing corrected to remove The Tulip starter-home price and specifications.",
    needsVerification: false
  },
  {
    id: "dogwood",
    name: "Dogwood",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: true,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Dogwood. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "timberland-custom",
    name: "Timberland Custom",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: true,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Timberland Custom. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "atmos",
    name: "Atmos",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Atmos. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "born-to-run",
    name: "Born to Run",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Born to Run. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "hey-jude",
    name: "Hey Jude",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Hey Jude. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "boujee-xl-2",
    name: "Boujee XL 2",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Boujee XL 2. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "oak",
    name: "Oak",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Oak. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "move-on-up",
    name: "Move On Up",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: null,
    status: "Coming Soon",
    featured: true,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Move On Up. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "28x60",
    name: "28x60",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: "28' x 60'",
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for 28x60. TODO: confirm price, beds/baths, square footage, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "16x72",
    name: "16x72",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: "16' x 72'",
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for 16x72. TODO: confirm price, beds/baths, square footage, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  },
  {
    id: "12x40",
    name: "12x40",
    manufacturer: null, // TODO: confirm manufacturer
    price: null, // TODO: confirm price
    beds: null, // TODO: confirm beds/baths
    baths: null, // TODO: confirm beds/baths
    squareFeet: null, // TODO: confirm square footage
    size: "12' x 40'",
    status: "Coming Soon",
    featured: false,
    onDisplay: false,
    newArrival: false,
    specialOffer: false,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for 12x40. TODO: confirm price, beds/baths, square footage, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
  }
];

export function getFeaturedHomes() {
  return homes.filter((home) => home.featured);
}

export function getHomeById(id: string) {
  return homes.find((home) => home.id === id);
}
