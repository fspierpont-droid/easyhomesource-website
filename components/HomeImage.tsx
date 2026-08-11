"use client";

import React, { useState } from "react";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";

export function HomeImage({
  src,
  alt,
  className = "",
  placeholderTitle = "Photo coming soon"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <MediaPlaceholder title={placeholderTitle} className={className} />;
  }

  // Detect floor plan blueprints to prevent cropping
  const isFloorPlan =
    /floor[-_]?plans?[-_.]|blueprint|\/flp\/|layout[-_.]/i.test(src) ||
    /floor\s*plan|blueprint|schematic/i.test(alt);
  const isRealPhoto = /[-_](ext|int|kit|bed|bath|uti)[-_]/i.test(src);

  const shouldContain = isFloorPlan && !isRealPhoto;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${shouldContain ? 'bg-white p-2' : 'bg-slate-100'} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full h-full ${shouldContain ? 'object-contain' : 'object-cover'} transition-opacity duration-300`}
      />
    </div>
  );
}
