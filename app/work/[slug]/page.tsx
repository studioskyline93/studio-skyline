import { notFound } from "next/navigation";
import { WorkDetailClient } from "@/components/work-detail-client";

type WorkVideo = { src: string; title?: string };
type WorkCollection = {
  slug: string;
  index?: string;
  title: string;
  subtitle?: string;
  description?: string;
  videos: WorkVideo[];
};
type WorkData = { collections: WorkCollection[] };

async function getWork(): Promise<WorkData> {
  try {
    const baseUrl = "https://studio-skyline.vercel.app";
    const res = await fetch(`${baseUrl}/api/work`, { cache: "no-store" });
    if (!res.ok) return { collections: [] };
    return res.json();
  } catch (error) {
    return { collections: [] };
  }
}

export async function generateStaticParams() {
  const data = await getWork();
  return data.collections.map((c) => ({ slug: c.slug }));
}

export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const work = await getWork();
  const collection = work.collections.find((c) => c.slug === slug);

  if (!collection) notFound();

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          {collection.index && (
            <div className="text-xs tracking-[0.25em] text-zinc-500">
              {collection.index}
            </div>
          )}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {collection.title}
          </h1>
          {collection.subtitle && (
            <p className="mt-2 text-sm text-zinc-600">{collection.subtitle}</p>
          )}
        </header>

        <WorkDetailClient 
          videos={collection.videos || []} 
          collectionIndex={collection.index}
        />

        {collection.description && (
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-zinc-600">
            {collection.description}
          </p>
        )}
      </div>
    </main>
  );
}