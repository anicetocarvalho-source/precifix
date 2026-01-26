import { Skeleton } from '@/components/ui/skeleton';

export function EditProposalSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-10 h-10 rounded" />
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Question Card */}
      <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-xl border border-border"
            >
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function EditMultiServiceProposalSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main Form */}
      <div className="flex-1 max-w-3xl mx-auto lg:mx-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-10 h-10 rounded" />
          <Skeleton className="h-6 w-56" />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-16 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-56 mx-auto mb-2" />
            <Skeleton className="h-5 w-40 mx-auto" />
          </div>

          <div className="space-y-6">
            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border"
                    >
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Pricing Preview Sidebar */}
      <div className="hidden lg:block w-80">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-24">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
