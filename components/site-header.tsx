"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { X, Menu } from "lucide-react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/production-house", label: "Production House" }, // 👈 add this
  { href: "/clients", label: "Clients" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const bodyLock = useMemo(() => {
    return (locked: boolean) => {
      if (typeof document === "undefined") return;
      document.body.style.overflow = locked ? "hidden" : "";
    };
  }, []);

  useEffect(() => {
    bodyLock(open);
    return () => bodyLock(false);
  }, [open, bodyLock]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3 no-underline">
        <div className="relative h-12 w-36 overflow-hidden rounded-xl md:h-14 md:w-44">



        <Image
  src="/brand/logo.png"
  alt="Studio Skyline Logo"
  fill
  className="object-contain scale-110"
  priority
/>

          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              Studio Skyline
            </div>
            <div className="text-xs text-zinc-600">Graphics Pvt. Ltd.</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-zinc-700 hover:text-zinc-950 no-underline"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 px-4 py-2 text-sm md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-white transition",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col px-5 py-5 md:px-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">Navigation</div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 px-4 py-2 text-sm"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="mt-10 grid gap-4">
            {nav.map((n, idx) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="no-underline"
              >
                <div className="flex items-baseline justify-between border-b border-zinc-200/60 py-4">
                  <div className="text-3xl font-semibold tracking-tight md:text-5xl">
                    {n.label}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-auto pb-6 text-xs text-zinc-500">
            Premium packaging • print • manufacturing
          </div>
        </div>
      </div>
    </header>
  );
}
