export type HomeStatus = "Available" | "Coming Soon" | "Sold";

export type Home = {
  id: string;
  name: string;
  manufacturer: string | null;
  price: string | null;
  beds: number | null;
  baths: number | null;
  squareFeet: number | null;
  size: string | null;
  status: HomeStatus;
  featured: boolean;
  onDisplay: boolean;
  newArrival: boolean;
  specialOffer: boolean;
  locationOnLot: string | null;
  mainImage: string | null;
  floorplanImage: string | null;
  description: string;
  features: string[];
  notes: string;
  needsVerification: boolean;
};

const defaultDescription = "A starter Easy HomeSource inventory placeholder. Contact the Brooksville team for current availability, verified specifications, options, and next steps.";
const defaultFeatures = ["Manufactured home", "Brooksville-area dealership support", "Financing conversation available", "Delivery and setup coordination guidance"];

export const homes: Home[] = [
  {
    id: "paxton",
    name: "Paxton",
    manufacturer: null, // TODO: confirm manufacturer
    price: "$39,888",
    beds: 1,
    baths: 1,
    squareFeet: 480,
    size: "12' x 40'",
    status: "Coming Soon",
    featured: true,
    onDisplay: true,
    newArrival: true,
    specialOffer: true,
    locationOnLot: null,
    mainImage: null, // TODO: add real image
    floorplanImage: null, // TODO: add real floorplan
    description: defaultDescription,
    features: defaultFeatures,
    notes: "Starter inventory placeholder for Paxton. TODO: confirm price, beds/baths, square footage, size, lot location, manufacturer, image, and floorplan.",
    needsVerification: true
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
