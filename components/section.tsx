import { cn } from "@/lib/utils";

export function Section(props: {
  kicker: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-10 md:py-14", props.className)}>
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            {props.kicker}
          </div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            {props.title}
          </h2>
          {props.description ? (
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-zinc-700 md:text-lg">
              {props.description}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-5">{props.right}</div>

        {props.children ? (
          <div className="md:col-span-12">{props.children}</div>
        ) : null}
      </div>
    </section>
  );
}
