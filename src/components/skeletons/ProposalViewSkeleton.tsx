import { Skeleton } from '@/components/ui/skeleton';

export function ProposalViewSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-28 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-32 rounded" />
          <Skeleton className="h-9 w-36 rounded" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        ))}
        <div className="bg-card rounded-xl p-4 border border-border lg:col-span-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Document Tabs */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-6 py-4">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>

        <div className="p-8 space-y-8">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-56" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          </div>

          {/* Content Sections */}
          {Array.from({ length: 3 }).map((_, i) => (
            <section key={i} className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-3 pl-8">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
