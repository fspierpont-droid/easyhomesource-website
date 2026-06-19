import Link from "next/link";
import type { VideoItem } from "@/data/videos";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";

export function VideoCard({ video }: { video: VideoItem }) {
  const askHref = video.relatedHomeSlug ? `/homes/${video.relatedHomeSlug}#lead-form` : "/contact";
  const ctaLabel = video.relatedHomeSlug ? "Ask About This Home" : "Start Your Journey";
  const isHostedVideo = video.videoUrl?.toLowerCase().endsWith(".mp4");

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-borderGray bg-white shadow-sm">
      <div className="relative">
        {isHostedVideo ? (
          <video
            className="aspect-video w-full bg-ehsBlack object-cover"
            controls
            preload="metadata"
            poster={video.thumbnailImage ?? undefined}
          >
            <source src={video.videoUrl ?? undefined} type="video/mp4" />
            Your browser does not support embedded video playback.
          </video>
        ) : (
          <>
            {video.thumbnailImage ? (
              <div
                className="h-56 bg-cover bg-center"
                role="img"
                aria-label={`${video.title} thumbnail`}
                style={{ backgroundImage: `url(${video.thumbnailImage})` }}
              />
            ) : (
              <MediaPlaceholder title="Video coming soon" className="rounded-none" />
            )}
            {video.videoUrl && (
              <Link
                href={video.videoUrl}
                className="absolute inset-0 grid place-items-center bg-ehsBlack/20 text-white"
              >
                <span className="rounded-full bg-ehsBlue px-5 py-3 font-black">Play</span>
              </Link>
            )}
          </>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsBlack">
            {video.category}
          </span>
          <span className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsBlack">
            {video.platform}
          </span>
        </div>
        <h3 className="text-2xl font-black text-ehsBlack">{video.title}</h3>
        <p className="leading-7 text-ehsBlack/70">{video.description}</p>
        <Link
          href={askHref}
          className="inline-flex rounded-full border border-ehsBlue px-5 py-3 text-sm font-black text-ehsBlue hover:bg-ehsSoftBlue"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
