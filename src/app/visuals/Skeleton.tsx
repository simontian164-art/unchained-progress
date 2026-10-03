import { cn } from "@/lib/utils";

/** Skeletons where the layout is known; a spinner only for tiny inline waits. */
export const Bone = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-lg bg-white/[0.06] motion-reduce:animate-none", className)} />;

export const PageSkeleton = () => (
  <div className="mx-auto max-w-5xl space-y-5 px-4 pt-20 sm:px-6" role="status" aria-label="Loading">
    <Bone className="h-4 w-40" />
    <Bone className="h-9 w-64" />
    <div className="grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((i) => <Bone key={i} className="h-28" />)}
    </div>
    {[0, 1, 2].map((i) => <Bone key={i} className="h-24" />)}
  </div>
);

export const InlineSpinner = ({ label }: { label: string }) => (
  <span role="status" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/70 motion-reduce:animate-none" aria-hidden="true" />
    {label}
  </span>
);
