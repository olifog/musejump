import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Track Artwork Skeleton */}
        <Skeleton className="h-64 w-64 md:h-80 md:w-80 rounded-lg shrink-0" />

        <div className="flex-grow space-y-6 w-full">
          {/* Track Title & Artist Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Album Info Skeleton */}
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Action Buttons / Other Details Skeleton */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Placeholder for other sections like Lyrics or Recommendations */}
          <div className="pt-6 space-y-4">
             <Skeleton className="h-6 w-40 mb-4" />
             <Skeleton className="h-20 w-full rounded-lg" />
             <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
} 