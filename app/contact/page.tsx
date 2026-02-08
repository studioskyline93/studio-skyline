import { Section } from "@/components/section";
import ContactContentBlock from "@/components/contact-content";

export default function ContactPage() {
  return (
    <>
      {/* Optional: keep this Section if you want a consistent page heading,
          but it will be static. If you want it dynamic too, we’ll update it next. */}
      <Section
        kicker="Enquiries"
        title="Contact"
        description="Tell us what you’re making. We’ll respond with the right next steps."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* LIVE contact info from admin */}
        <ContactContentBlock />

        {/* Keep your form card unchanged */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white p-6">
          <div className="text-sm font-semibold">Quick form (frontend only)</div>
          <p className="mt-2 text-sm text-zinc-600">
            This is UI-only. If you want it to send emails, I’ll add Resend/SMTP or a simple API route.
          </p>

          <form className="mt-5 space-y-3">
            <input
              className="w-full rounded-xl border border-zinc-200/60 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              placeholder="Name"
            />
            <input
              className="w-full rounded-xl border border-zinc-200/60 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              placeholder="Email"
              type="email"
            />
            <input
              className="w-full rounded-xl border border-zinc-200/60 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              placeholder="What do you need? (boxes, bags, books...)"
            />
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-zinc-200/60 px-4 py-3 text-sm outline-none focus:border-zinc-400"
              placeholder="Details, quantities, timelines, finishes..."
            />
            <button
              type="button"
              className="rounded-full bg-[color:var(--brand-red)] px-5 py-2 text-sm font-medium text-white"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
