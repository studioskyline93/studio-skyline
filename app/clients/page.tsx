import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import site from "@/content/site.json";

export default function ClientsPage() {
  const clients = site.clients?.items ?? [];

  return (
    <>
      <Section
        kicker="Trust"
        title={site.clients?.title ?? "Clients"}
        description={site.clients?.subtitle ?? ""}
      />

      <div className="rounded-3xl border border-zinc-200/60 bg-white/70 backdrop-blur p-6 md:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {clients.map((c, i) => {
  const cell = c.logo ? (
    <div className="relative h-10 w-full max-w-[140px] opacity-70 transition group-hover:opacity-100">
      <Image
        src={c.logo}
        alt={c.name}
        fill
        sizes="140px"
        className="object-contain"
      />
    </div>
  ) : (
    <div className="text-xs text-zinc-400">{c.name}</div>
  );

  const baseClass =
    "group flex items-center justify-center rounded-2xl border border-zinc-200/60 bg-white p-6 transition hover:border-zinc-400/60";

  return c.url ? (
    <Link
      key={`${c.name}-${i}`}
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
    >
      {cell}
    </Link>
  ) : (
    <div key={`${c.name}-${i}`} className={baseClass}>
      {cell}
    </div>
  );
})}

        </div>
      </div>
    </>
  );
}
