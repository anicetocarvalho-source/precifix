import { Skeleton } from '@/components/ui/skeleton';

export function HistoryTableRowSkeleton({ showAuthor = false }: { showAuthor?: boolean }) {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </td>
      {showAuthor && (
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        </td>
      )}
      <td className="py-4 px-6">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="py-4 px-6 text-center">
        <Skeleton className="h-5 w-16 mx-auto" />
      </td>
      <td className="py-4 px-6 text-right">
        <Skeleton className="h-5 w-24 ml-auto" />
      </td>
      <td className="py-4 px-6 text-center">
        <Skeleton className="h-6 w-20 rounded-full mx-auto" />
      </td>
      <td className="py-4 px-6 text-center">
        <Skeleton className="h-4 w-24 mx-auto" />
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </td>
    </tr>
  );
}

export function HistoryTableSkeleton({ showAuthor = false }: { showAuthor?: boolean }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-4 px-6">
                <Skeleton className="h-4 w-16" />
              </th>
              {showAuthor && (
                <th className="text-left py-4 px-6">
                  <Skeleton className="h-4 w-12" />
                </th>
              )}
              <th className="text-left py-4 px-6">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-center py-4 px-6">
                <Skeleton className="h-4 w-16 mx-auto" />
              </th>
              <th className="text-right py-4 px-6">
                <Skeleton className="h-4 w-12 ml-auto" />
              </th>
              <th className="text-center py-4 px-6">
                <Skeleton className="h-4 w-14 mx-auto" />
              </th>
              <th className="text-center py-4 px-6">
                <Skeleton className="h-4 w-12 mx-auto" />
              </th>
              <th className="text-right py-4 px-6">
                <Skeleton className="h-4 w-14 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <HistoryTableRowSkeleton key={i} showAuthor={showAuthor} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
