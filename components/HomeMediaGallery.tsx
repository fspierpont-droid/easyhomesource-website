"use client";

import React, { useMemo, useState } from "react";
import { HomeImage } from "@/components/HomeImage";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import type { GalleryCategory, HomeGalleryItem } from "@/data/homes";

const categories: { key: GalleryCategory; label: string }[] = [
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Living & Interior" },
  { key: "kitchen", label: "Kitchen & Dining" },
  { key: "bedroom", label: "Bedrooms" },
  { key: "bathroom", label: "Bathrooms" },
  { key: "floorplan", label: "Floor Plan & Schematics" },
  { key: "other", label: "Utility & Additional Features" }
];

export function HomeMediaGallery({
  homeName,
  gallery
}: {
  homeName: string;
  gallery: HomeGalleryItem[];
}) {
  const images = useMemo(() => gallery.filter((item) => item.category !== "video"), [gallery]);
  const primary = images.find((item) => item.isPrimary) ?? images[0];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openImage = (src: string) => {
    const index = images.findIndex((item) => item.src === src);
    setActiveIndex(index >= 0 ? index : 0);
  };

  const close = () => setActiveIndex(null);
  const active = activeIndex == null ? null : images[activeIndex];
  const showPrevious = () =>
    setActiveIndex((value) => (value == null ? value : (value - 1 + images.length) % images.length));
  const showNext = () =>
    setActiveIndex((value) => (value == null ? value : (value + 1) % images.length));

  if (!images.length) {
    return <MediaPlaceholder title="Photos coming soon" className="mt-6 sm:mt-8 min-h-[300px] sm:min-h-[420px] rounded-2xl sm:rounded-[2rem]" />;
  }

  return (
    <section className="mt-6 sm:mt-8 space-y-6">
      {/* Primary Hero Photo */}
      {primary && (
        <button
          type="button"
          onClick={() => openImage(primary.src)}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-xl shadow-black/10 focus:outline-none focus:ring-4 focus:ring-[#1E6FA8]/50"
          aria-label={`Open main photo for ${homeName}`}
        >
          <div className="h-[280px] sm:h-[450px] md:h-[540px] w-full">
            <HomeImage
              src={primary.src}
              alt={primary.alt || `${homeName} primary exterior photo`}
              className="h-full w-full rounded-none"
              placeholderTitle="Photo coming soon"
            />
          </div>
          <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-[#0B1E38]/80 px-3.5 py-1.5 text-xs font-black text-white shadow-sm opacity-90 transition-opacity group-hover:opacity-100">
            🔍 Click to enlarge ({images.length} Photos)
          </span>
        </button>
      )}

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {images.slice(0, 6).map((image, idx) => (
            <button
              key={`thumb-${image.src}-${idx}`}
              type="button"
              onClick={() => openImage(image.src)}
              className="group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 shadow-2xs hover:border-[#1E6FA8] focus:outline-none focus:ring-2 focus:ring-[#1E6FA8]"
              aria-label={`Open ${image.alt}`}
            >
              <HomeImage
                src={image.src}
                alt={image.alt}
                className="h-full w-full rounded-none group-hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
      )}

      {/* Categorized Photo Sections */}
      <div className="space-y-8 pt-2">
        {categories.map(({ key, label }) => {
          const items = images.filter((item) => item.category === key);
          if (!items.length) return null;

          return (
            <section key={key} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-[#0B1E38]">{label}</h3>
                <span className="text-xs font-bold text-slate-400">
                  {items.length} {items.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item, idx) => (
                  <button
                    key={`${key}-${item.src}-${idx}`}
                    type="button"
                    onClick={() => openImage(item.src)}
                    className="group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 shadow-2xs hover:border-[#1E6FA8] focus:outline-none focus:ring-2 focus:ring-[#1E6FA8]"
                    aria-label={`Open ${item.alt}`}
                  >
                    <HomeImage
                      src={item.src}
                      alt={item.alt}
                      className="h-full w-full rounded-none group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Zoom Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1E38]/95 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${homeName} image viewer`}
          onClick={close}
        >
          <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#A8C8E6]">{homeName}</p>
                <p className="text-sm sm:text-base font-black truncate max-w-xl">{active.alt}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0B1E38] px-4 py-2 text-xs font-black transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/50 flex items-center justify-center min-h-[300px] max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.src}
                alt={active.alt}
                className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPrevious}
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black transition-colors cursor-pointer"
                >
                  ← Previous
                </button>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white font-mono">
                  {(activeIndex ?? 0) + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={showNext}
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
