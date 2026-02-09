"use client";

import { VideoTripleView } from "@/components/video-triple-view";

type WorkVideo = { src: string; title?: string };

export function WorkDetailClient({
  videos,
  collectionIndex,
}: {
  videos: WorkVideo[];
  collectionIndex?: string;
}) {
  return <VideoTripleView videos={videos} collectionIndex={collectionIndex} />;
}