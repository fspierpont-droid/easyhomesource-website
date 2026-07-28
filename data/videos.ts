export type VideoCategory = "Walkthroughs" | "Featured Homes" | "Lot & Tour" | "Financing & Process";
export type VideoItem = { id: string; title: string; description: string; videoUrl: string | null; thumbnailImage: string | null; platform: "Website" | "YouTube" | "Facebook" | "Instagram" | "X" | "TikTok" | "Placeholder"; relatedHomeSlug: string | null; category: VideoCategory; };
export const videoCategories: VideoCategory[] = ["Walkthroughs", "Featured Homes", "Lot & Tour", "Financing & Process"];
export const videos: VideoItem[] = [
  { id: "start-owning-your-future", title: "Start Owning Your Future", description: "See how Easy HomeSource helps bring the home, land, delivery, and setup together, with a clear path from home shopping to the next step.", videoUrl: "/videos/start-owning-your-future.mp4", thumbnailImage: "/videos/start-owning-your-future-poster.jpg", platform: "Website", relatedHomeSlug: null, category: "Financing & Process" }
  // Add walkthrough, featured-home, and lot-tour cards only after approved video URLs or assets are available.
];
