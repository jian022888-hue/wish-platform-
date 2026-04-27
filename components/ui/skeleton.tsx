import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-full bg-stone-200 dark:bg-stone-700", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[32px] bg-stone-100/75 p-6 sm:p-8 dark:bg-surface-dark">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-[80%]" />
      <Skeleton className="mt-2 h-4 w-[60%]" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-[40%]" />
      <div className="grid gap-5 sm:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
