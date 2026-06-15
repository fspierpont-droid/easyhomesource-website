"use client";

import Image from "next/image";
import { useState } from "react";

const logoPath = "/images/easy-homesource-logo.png";

export function SiteLogo() {
  const [showImage, setShowImage] = useState(true);

  return (
    <span className="inline-flex min-h-10 items-center">
      {showImage ? (
        // TODO: upload the real logo file to public/images/easy-homesource-logo.png
        <Image
          src={logoPath}
          alt="Easy HomeSource"
          width={220}
          height={40}
          className="h-10 w-auto max-w-[220px] object-contain"
          priority
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className="text-lg font-black text-forest">Easy HomeSource</span>
      )}
    </span>
  );
}
