export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
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
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.VERCEL_URL ||
    "";

  const proto = h.get("x-forwarded-proto") || "https";

  if (!host) return { collections: [] };

  const base = host.startsWith("http") ? host : `${proto}://${host}`;

  const res = await fetch(`${base}/api/work`, { cache: "no-store" });
  if (!res.ok) return { collections: [] };

  return res.json();
}


export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const work = await getWork();
  const collection = (work.collections || []).find((c) => c.slug === slug);

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
