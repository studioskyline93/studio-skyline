export default function AdminPage() {
    return (
      <main className="px-6 pt-24 pb-16">
        <div id="top" />
        <div className="mx-auto max-w-4xl">
          {/* HEADER */}
          <h1 className="text-2xl font-semibold tracking-tight">
            Studio Admin
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Manage site content without touching code.
          </p>
  
          {/* INDEX / JUMP LINKS */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              href="#production-house"
              className="rounded-full border border-zinc-200/60 px-4 py-2 hover:bg-zinc-50"
            >
              Production House
            </a>
            <a
              href="#home"
              className="rounded-full border border-zinc-200/40 px-4 py-2 text-zinc-400"
            >
              Home
            </a>
            <a
              href="#work"
              className="rounded-full border border-zinc-200/40 px-4 py-2 text-zinc-400"
            >
              Work
            </a>
            <a
              href="#testimonials"
              className="rounded-full border border-zinc-200/40 px-4 py-2 text-zinc-400"
            >
              Testimonials
            </a>
          </div>
  
          {/* SECTIONS */}
          <div className="mt-14 grid gap-16">
            {/* Production House */}
            <section id="production-house">
              <a href="#top" className="block text-xs text-zinc-400 mb-2">
                ↑ Back to index
              </a>
  
              <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur">
                <div className="text-sm font-medium">Production House</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Edit hero media, machines, and workflow visuals
                </div>
  
                <a
                  href="/admin/production-house"
                  className="mt-4 inline-block text-sm underline"
                >
                  Open editor →
                </a>
              </div>
            </section>
  
            {/* Home */}
            <section id="home">
              <div className="rounded-2xl border border-zinc-200/40 bg-zinc-50 p-6 text-sm text-zinc-400">
                Home (coming next)
              </div>
            </section>
  
            {/* Work */}
            <section id="work">
  <a href="#top" className="block text-xs text-zinc-400 mb-2">
    ↑ Back to index
  </a>

  <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur">
    <div className="text-sm font-medium">Work</div>
    <div className="mt-1 text-xs text-zinc-500">
      Manage collections and Work videos
    </div>

    <a href="/admin/work" className="mt-4 inline-block text-sm underline">
      Open editor →
    </a>
  </div>
</section>

            {/* Testimonials */}
            <section id="testimonials">
              <div className="rounded-2xl border border-zinc-200/40 bg-zinc-50 p-6 text-sm text-zinc-400">
                Testimonials (coming next)
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }
  