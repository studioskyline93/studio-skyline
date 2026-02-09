import { notFound } from "next/navigation";

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
    <div className="p-8">
      <h1 className="text-4xl">{collection.title}</h1>
      <p>{collection.subtitle}</p>
      <p>Videos: {collection.videos?.length || 0}</p>
      <pre>{JSON.stringify(collection.videos, null, 2)}</pre>
    </div>
  );
}