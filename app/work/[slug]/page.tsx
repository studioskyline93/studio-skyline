import { notFound } from "next/navigation";
import { VideoTripleView } from "@/components/video-triple-view";

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
    // Use the deployed URL directly
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.VERCEL_URL || 
                    "https://studio-skyline.vercel.app";
    
    const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    
    const res = await fetch(`${url}/api/work`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch work:", res.status);
      return { collections: [] };
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching work:", error);
    return { collections: [] };
  }
}

// Tell Next.js which slugs to pre-render
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
          {collection.index ? (
            <div className="text-xs tracking-[0.25em] text-zinc-500">
              {collection.index}
            </div>
          ) : null}

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {collection.title}
          </h1>

          {collection.subtitle ? (
            <p className="mt-2 text-sm text-zinc-600">{collection.subtitle}</p>
          ) : null}
        </header>

        <VideoTripleView videos={collection.videos || []} />

        {collection.description ? (
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-zinc-600">
            {collection.description}
          </p>
        ) : null}
      </div>
    </main>
  );
}