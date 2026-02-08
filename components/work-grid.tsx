import Link from "next/link";
import rawWork from "@/content/work.json";

const work = rawWork as any;

type WorkCollection = {
  slug: string;
  index?: string;
  title: string;
  subtitle?: string;
  description?: string;
  videos: { src: string; title?: string }[];
};

export default function WorkGrid() {
  const collections = (work.collections ?? []) as WorkCollection[];

  if (collections.length === 0) {
    return (
      <div className="text-sm text-zinc-500">
        No work categories found in work.json.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {collections.map((c) => (
        <Link
          key={c.slug}
          href={`/work/${c.slug}`}
          className="group no-underline"
        >
          <div className="rounded-2xl border border-zinc-200/60 bg-white transition hover:border-zinc-400/60">
            <div className="flex h-full flex-col justify-between p-6">
              <div>
                {c.index ? (
                  <div className="text-xs tracking-[0.25em] text-zinc-500">
                    {c.index}
                  </div>
                ) : null}

                <div className="mt-3 text-2xl font-semibold tracking-tight">
                  {c.title}
                </div>

                {c.subtitle ? (
                  <div className="mt-2 text-sm text-zinc-600">{c.subtitle}</div>
                ) : null}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-zinc-200/60 pt-4">
                <div className="text-sm text-zinc-600">
                  {c.videos.length} video{c.videos.length === 1 ? "" : "s"}
                </div>
                <div className="text-sm text-zinc-500 transition group-hover:text-zinc-900">
                  View →
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
