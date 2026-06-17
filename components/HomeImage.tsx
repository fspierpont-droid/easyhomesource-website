"use client";

import { useState } from "react";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";

export function HomeImage({ src, alt, className = "", placeholderTitle = "Photo coming soon" }: { src?: string | null; alt: string; className?: string; placeholderTitle?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <MediaPlaceholder title={placeholderTitle} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden bg-ehsSoftBlue ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
