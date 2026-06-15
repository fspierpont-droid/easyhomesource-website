import { VideoCard } from "@/components/VideoCard";
import { videoCategories, videos } from "@/data/videos";

export const metadata = { title: "Videos", description: "Watch Easy HomeSource home tours, new arrivals, financing guidance, delivery and setup videos, and customer education reels." };

export default function VideosPage() {
  return <main className="px-4 py-12"><section className="mx-auto max-w-6xl"><p className="font-black text-ehsBlue">Videos & Reels</p><h1 className="mt-2 text-4xl font-black text-ehsBlack">See What’s Happening at Easy HomeSource</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-ehsBlack/75">Watch home tours, new arrivals, walkthroughs, and helpful videos from the Easy HomeSource team.</p><div className="mt-8 flex flex-wrap gap-2" aria-label="Future video filters">{videoCategories.map((category) => <span key={category} className="rounded-full bg-ehsSoftBlue px-4 py-2 text-sm font-black text-ehsBlack">{category}</span>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-2">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div></section></main>;
}
