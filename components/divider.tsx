export function Divider({ label }: { label?: string }) {
    return (
      <div className="my-10 md:my-14">
        <div className="flex items-center gap-4">
          {label ? (
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {label}
            </div>
          ) : null}
          <div className="h-px flex-1 bg-zinc-200/60" />
        </div>
      </div>
    );
  }
  