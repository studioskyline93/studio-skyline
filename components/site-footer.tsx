import Link from "next/link";
import { SITE } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/60bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">{SITE.name}</div>
            <div className="mt-2 text-sm text-zinc-600">
              {SITE.addressLine}
              <br />
              {SITE.city}
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            <div className="font-medium text-zinc-950">Enquiries</div>
            <div className="mt-2">
              <a className="underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              <div className="mt-1">{SITE.phone}</div>
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            <div className="font-medium text-zinc-950">Social</div>
            <div className="mt-2 flex gap-4">
              <a className="underline" href={SITE.socials.instagram}>
                Instagram
              </a>
              <a className="underline" href={SITE.socials.youtube}>
                YouTube
              </a>
              <Link className="underline" href="/contact">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-zinc-500">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
