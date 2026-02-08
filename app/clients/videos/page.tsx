import { Section } from "@/components/section";
import { VIDEOS } from "@/content/site";

export default function VideosPage() {
  return (
    <>
      <Section
        kicker="Film"
        title="Videos"
        description="Manufacturing, finishing, behind-the-scenes, and highlights."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {VIDEOS.map((v) => (
          <div
            key={v.youtubeId}
            className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white"
          >
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${v.youtubeId}`}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <div className="text-lg font-semibold tracking-tight">
                {v.title}
              </div>
              {v.note ? (
                <div className="mt-1 text-sm text-zinc-600">{v.note}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
