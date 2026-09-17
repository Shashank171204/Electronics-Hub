/**
 * Skeleton loaders — shimmering placeholder blocks shown while API fetches
 * are in flight (replaces plain "Loading…" text). The `shimmer` utility in
 * index.css animates a soft gradient sweep across each block.
 */

export function Skeleton({ className = "" }) {
  return (
    <div className={`shimmer rounded-lg ${className}`} aria-hidden="true" />
  );
}

/** Full product-card placeholder mirroring the real card's layout. */
export function ProductCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Order-row placeholder mirroring the real order card's layout. */
export function OrderRowSkeleton() {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-5">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}
