export type VideoCategory = "Home tours" | "New arrivals" | "Financing" | "Delivery & setup" | "Customer education";

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  thumbnailImage: string | null;
  platform: "YouTube" | "Facebook" | "Instagram" | "X" | "TikTok" | "Placeholder";
  relatedHomeSlug: string | null;
  category: VideoCategory;
};

export const videoCategories: VideoCategory[] = ["Home tours", "New arrivals", "Financing", "Delivery & setup", "Customer education"];

export const videos: VideoItem[] = [
  { id: "featured-home-tour", title: "Featured Home Tour", description: "Step through a featured Easy HomeSource home and see layout highlights, options, and next-step details.", videoUrl: null, thumbnailImage: null, platform: "Placeholder", relatedHomeSlug: "paxton", category: "Home tours" },
  { id: "new-arrival-walkthrough", title: "New Arrival Walkthrough", description: "A quick look at new arrivals as they are prepared for shoppers in Brooksville.", videoUrl: null, thumbnailImage: null, platform: "Placeholder", relatedHomeSlug: null, category: "New arrivals" },
  { id: "why-rent-own", title: "Why Rent When You Can Own?", description: "Helpful guidance for buyers comparing rent costs with manufactured home ownership possibilities.", videoUrl: null, thumbnailImage: null, platform: "Placeholder", relatedHomeSlug: "tulip", category: "Financing" },
  { id: "delivery-setup-explained", title: "Delivery & Setup Explained", description: "Learn what to expect with delivery, setup, permits, site conditions, and final project planning.", videoUrl: null, thumbnailImage: null, platform: "Placeholder", relatedHomeSlug: null, category: "Delivery & setup" }
];
