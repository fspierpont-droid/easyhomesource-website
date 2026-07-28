import { VideoCard } from "@/components/VideoCard";
import { ButtonLink } from "@/components/ButtonLink";
import { videoCategories, videos } from "@/data/videos";

export const metadata = { title: "Videos", description: "Watch Easy HomeSource home tours, new arrivals, financing guidance, delivery and setup videos, and customer education reels." };

export default function VideosPage() {
  return <main className="px-4 py-12"><section className="mx-auto max-w-6xl">
    <div className="rounded-[2rem] bg-ehsSoftBlue p-6 sm:p-10"><p className="font-black text-ehsBlue">Videos & Walkthroughs</p><h1 className="mt-2 text-4xl font-black text-ehsBlack sm:text-5xl">See homes before you visit</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-ehsBlack/75">Watch quick walkthroughs, lot videos, and featured home previews before scheduling a tour.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><ButtonLink href="/contact">Schedule a Tour</ButtonLink><ButtonLink href="/homes" variant="secondary">View Available Homes</ButtonLink><ButtonLink href="/get-quote" variant="secondary">Get Pricing</ButtonLink></div></div>
    <div className="mt-8 flex flex-wrap gap-2" aria-label="Video topics">{videoCategories.map((category) => <span key={category} className="rounded-full bg-white px-4 py-2 text-sm font-black text-ehsBlack shadow-sm ring-1 ring-ehsBlue/10">{category}</span>)}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
    <div className="mt-10 rounded-[2rem] bg-ehsNavy p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8"><div><h2 className="text-2xl font-black">Want to walk through a home in person?</h2><p className="mt-2 text-white/75">Our Brooksville team can help you compare available homes and starting prices.</p></div><div className="mt-5 shrink-0 sm:mt-0"><ButtonLink href="/contact" variant="secondary">Schedule a Tour</ButtonLink></div></div>
  </section></main>;
}
