// app/production-house/page.tsx
import fs from "fs/promises";
import path from "path";
import ProductionHouseHero from "@/components/production-house-hero";

const SITE_PATH = path.join(process.cwd(), "content", "site.json");

export default async function Page() {
  const raw = await fs.readFile(SITE_PATH, "utf8");
  const site = JSON.parse(raw);

  const data = site.productionHouse;

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            {data.subtitle}
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.02em]">
            {data.title}
          </h1>
        </div>

        <ProductionHouseHero media={data.hero?.media ?? []} />

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {data.description}
        </p>
      </div>
    </main>
  );
}
