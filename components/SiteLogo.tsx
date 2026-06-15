"use client";

import Image from "next/image";
import { useState } from "react";

const logoPath = "/images/EHS_logo_vector_preview.png";

export function SiteLogo() {
  const [showImage, setShowImage] = useState(true);

  return (
    <span className="inline-flex min-h-10 items-center">
      {showImage ? (
        <Image
          src={logoPath}
          alt="Easy HomeSource"
          width={220}
          height={48}
          className="h-9 w-auto max-w-[180px] object-contain sm:h-10 sm:max-w-[220px]"
          priority
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className="text-lg font-black text-forest">Easy HomeSource</span>
      )}
    </span>
  );
}
