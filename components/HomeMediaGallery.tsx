"use client";

import { useMemo, useState } from "react";
import { HomeImage } from "@/components/HomeImage";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import type { GalleryCategory, HomeGalleryItem } from "@/data/homes";

const categories: { key: GalleryCategory; label: string }[] = [
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bathroom", label: "Bathroom" },
  { key: "bedroom", label: "Bedroom" },
  { key: "floorplan", label: "Floor Plan" },
  { key: "other", label: "Additional Photos" }
];

export function HomeMediaGallery({ homeName, gallery }: { homeName: string; gallery: HomeGalleryItem[] }) {
  const images = useMemo(() => gallery.filter((item) => item.category !== "video"), [gallery]);
  const primary = images.find((item) => item.isPrimary) ?? images[0];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openImage = (src: string) => {
    const index = images.findIndex((item) => item.src === src);
    setActiveIndex(index >= 0 ? index : 0);
  };

  const close = () => setActiveIndex(null);
  const active = activeIndex == null ? null : images[activeIndex];
  const showPrevious = () => setActiveIndex((value) => value == null ? value : (value - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((value) => value == null ? value : (value + 1) % images.length);

  if (!images.length) {
    return <MediaPlaceholder title="Photos coming soon" className="mt-8 min-h-[360px] rounded-[2rem]" />;
  }

  return (
    <section className="mt-8">
      {primary && <ImageButton image={primary} onClick={() => openImage(primary.src)} className="min-h-[360px] rounded-[2rem] shadow-xl shadow-ehsBlack/10" label="Open main home photo" />}

      {images.length > 1 && <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {images.slice(0, 6).map((image) => <ImageButton key={`thumb-${image.src}`} image={image} onClick={() => openImage(image.src)} className="min-h-32 rounded-2xl" label={`Open ${image.alt}`} />)}
      </div>}

      {categories.map(({ key, label }) => {
        const items = images.filter((item) => item.category === key);
        if (!items.length) return null;
        return (
          <section key={key} className="mt-8">
            <h2 className="text-2xl font-black text-ehsBlack">{label}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => <ImageButton key={`${key}-${item.src}`} image={item} onClick={() => openImage(item.src)} className="min-h-56" label={`Open ${item.alt}`} />)}
            </div>
          </section>
        );
      })}

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ehsBlack/90 p-4" role="dialog" aria-modal="true" aria-label={`${homeName} image viewer`} onClick={close}>
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-white/60">{homeName}</p>
                <p className="text-lg font-black">{active.alt}</p>
              </div>
              <button type="button" onClick={close} className="rounded-full bg-white px-5 py-3 text-sm font-black text-ehsBlack">Close</button>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.src} alt={active.alt} className="max-h-[78vh] w-full object-contain" />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button type="button" onClick={showPrevious} className="rounded-full bg-white px-5 py-3 text-sm font-black text-ehsBlack">Previous</button>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">{(activeIndex ?? 0) + 1} / {images.length}</span>
                <button type="button" onClick={showNext} className="rounded-full bg-white px-5 py-3 text-sm font-black text-ehsBlack">Next</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ImageButton({ image, onClick, className, label }: { image: HomeGalleryItem; onClick: () => void; className: string; label: string }) {
  return (
    <button type="button" onClick={onClick} className="group block w-full cursor-zoom-in rounded-[inherit] text-left focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/70" aria-label={label}>
      <div className="relative">
        <HomeImage src={image.src} alt={image.alt} className={className} placeholderTitle="Photo coming soon" />
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ehsBlack/75 px-3 py-1 text-xs font-black text-white opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">Click to enlarge</span>
      </div>
    </button>
  );
}
