"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { useState } from "react";

interface ArtworkImageProps extends Omit<ImageProps, "src"> {
  src: string;
  lqip?: string | null;
}

/**
 * next/image wrapper that degrades gracefully when the upstream image
 * host is unavailable: first falls back to the artwork's LQIP data-URI
 * placeholder, then to a simple "Image unavailable" block.
 */
export default function ArtworkImage({
  src,
  lqip,
  alt,
  className,
  fill,
  ...rest
}: ArtworkImageProps) {
  const [failed, setFailed] = useState(false);

  const fallbackClassName = `${className ?? ""}${fill ? " absolute inset-0 h-full w-full" : ""}`;

  if (failed) {
    if (lqip) {
      // Plain <img> intentionally: this is a tiny data-URI placeholder shown
      // only after next/image already failed; routing it back through
      // next/image would re-trigger the same failing load path.
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={lqip} alt={alt} className={fallbackClassName} />;
    }
    return (
      <div
        className={`${fallbackClassName} flex items-center justify-center bg-surface`}
      >
        <span className="text-muted-foreground text-xs italic">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      {...rest}
      onError={() => setFailed(true)}
    />
  );
}
