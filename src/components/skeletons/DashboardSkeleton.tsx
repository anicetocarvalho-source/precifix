import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-5 border border-border shadow-card"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardProposalRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-5 border-b border-border">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-24 ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
  );
}

export function DashboardTableSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <DashboardProposalRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
