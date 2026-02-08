"use client";

import { useState } from "react";

export function SafeVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-center">
        <div className="px-6">
          <div className="text-sm font-semibold text-zinc-900">
            {label ?? "Video"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Video coming soon</div>
        </div>
      </div>
    );
  }

  return (
    <video
      className={className}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      onError={() => setFailed(true)}
    />
  );
}
