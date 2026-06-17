"use client";

import { useState } from "react";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";

export function HomeImage({ src, alt, className = "", placeholderTitle = "Photo coming soon" }: { src?: string | null; alt: string; className?: string; placeholderTitle?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <MediaPlaceholder title={placeholderTitle} className={className} />;
  return <div className={`bg-cover bg-center ${className}`} role="img" aria-label={alt} style={{ backgroundImage: `url(${src})` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="hidden" onError={() => setFailed(true)} /></div>;
}
