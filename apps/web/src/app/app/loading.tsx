import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* User Header Skeleton */}
      <div className="flex items-center gap-3 mb-4 p-2 bg-gray-800 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Search Section Skeleton */}
      <div className="bg-gray-800 rounded-lg p-3 mb-3">
        <Skeleton className="h-4 w-28 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Recently Played Section Skeleton */}
        <div className="bg-gray-800 rounded-lg p-3">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="overflow-y-auto max-h-[70vh]">
            <TableSkeleton columnCount={3} rowCount={15} hasImage={true} />
          </div>
        </div>

        {/* Top Tracks Section Skeleton */}
        <div className="bg-gray-800 rounded-lg p-3">
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="overflow-y-auto max-h-[70vh]">
            <TableSkeleton
              columnCount={3}
              rowCount={15}
              hasImage={true}
              hasIndex={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
