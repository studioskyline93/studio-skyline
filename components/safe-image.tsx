"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "alt"> & {
  alt: string;
  fallbackLabel?: string;
};

export function SafeImage({ fallbackLabel, alt, ...props }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-center">
        <div className="px-6">
          <div className="text-sm font-semibold text-zinc-900">
            {fallbackLabel ?? alt}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Image coming soon</div>
        </div>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      {...props}
      onError={() => setFailed(true)}
    />
  );
}
