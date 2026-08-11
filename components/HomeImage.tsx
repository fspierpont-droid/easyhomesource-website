"use client";

import { useState } from "react";
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
  if (!src || failed) return <MediaPlaceholder title={placeholderTitle} className={className} />;

  // Detect floor plans and blueprints so they render without cropping
  const isFloorPlan =
    /floor[-_]?plans?|flp|blueprint|layout|floor_plans/i.test(src) ||
    /floor[-_]?plans?|blueprint|layout/i.test(alt);

  if (isFloorPlan) {
    return (
      <div
        className={`bg-contain bg-center bg-no-repeat bg-white p-2 flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt}
        style={{ backgroundImage: `url("${src}")` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="hidden" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      role="img"
      aria-label={alt}
      style={{ backgroundImage: `url("${src}")` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="hidden" onError={() => setFailed(true)} />
    </div>
  );
}
