'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 py-4 border-b border-white/[0.04]">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 flex-1 max-w-32" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-24" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} />)}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[#161B22] border border-white/[0.06]">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
