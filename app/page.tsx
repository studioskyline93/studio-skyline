import Link from "next/link";
import { Section } from "@/components/section";
import { WorkReel } from "@/components/work-reel";
import { Divider } from "@/components/divider";
import { Reveal } from "@/components/reveal";
import rawSite from "@/content/site.json";
import HomeTestimonials from "@/components/home-testimonials";

const site = rawSite as any;


export default function HomePage() {
  const home = site.home.hero;
  return (
    <div className="grain">
      <Reveal>
        {/* HERO */}
        <div className="rounded-3xl bg-white/65 backdrop-blur p-5 md:p-7 shadow-[0_1px_0_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/60">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="text-xs uppercase tracking-widest text-zinc-500">
              {home.city}
              </div>
              <div className="mt-3 h-px w-12 bg-[color:var(--brand-red)]/70" />

              <h1 className="mt-4 max-w-[22ch] text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">
              {home.title}
              </h1>

              <p className="mt-4 max-w-[60ch] text-[14px] leading-relaxed text-zinc-600 md:text-[15px]">
              {home.intro}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
              <Link
  href={home.ctaPrimary.href}
  className="rounded-full bg-[color:var(--brand-red)] px-4 py-2 text-[13px] font-medium text-white no-underline"
>
  {home.ctaPrimary.label}
</Link>


<Link
  href={home.ctaSecondary.href}
  className="rounded-full border border-zinc-200/60 px-4 py-2 text-[13px] font-medium text-zinc-950 no-underline"
>
  {home.ctaSecondary.label}
</Link>
<Link
  href={home.ctaTertiary.href}
  className="rounded-full border border-zinc-200/60 px-4 py-2 text-[13px] font-medium text-zinc-950 no-underline"
>
  {home.ctaTertiary.label}
</Link>

              </div>
            </div>

            <div className="md:col-span-4">
              <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-5">
                <div className="text-sm font-semibold">Capabilities</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  <li>Fancy rigid boxes &amp; mono cartons</li>
                  <li>Paper bags</li>
                  <li>Invitation cards &amp; stationery</li>
                  <li>Books, catalogues &amp; printing</li>
                  <li>Manufacturing &amp; finishing</li>
                </ul>
                <div className="mt-5 text-xs text-zinc-500">
  {home.highlight}
</div>

              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Section kicker="Work" title="Work" description="">
          {/* Reel ABOVE the video */}
          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
            <WorkReel />
          </div>

          {/* Video BELOW the reel */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur">
            <div className="aspect-video w-full bg-black/5">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/sGJJgBfHy5E"
                title="Studio Film"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <HomeTestimonials />
      </Reveal>

    </div>
  );
}

