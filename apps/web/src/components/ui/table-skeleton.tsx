import { Skeleton } from "./skeleton";

interface TableSkeletonProps {
  columnCount: number;
  rowCount: number;
  hasImage?: boolean;
  hasIndex?: boolean;
}

export function TableSkeleton({
  columnCount,
  rowCount,
  hasImage = false,
  hasIndex = false,
}: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Table header */}
      <div
        className="mb-2 pb-2 border-b border-gray-700 grid"
        style={{
          gridTemplateColumns: `${hasIndex ? "40px " : ""}${hasImage ? "40px " : ""}repeat(${columnCount - (hasIndex ? 1 : 0) - (hasImage ? 1 : 0)}, 1fr)`,
        }}
      >
        {hasIndex && <Skeleton className="h-3 w-4 mx-auto" />}
        {hasImage && <Skeleton className="h-3 w-full" />}
        {Array(columnCount - (hasIndex ? 1 : 0) - (hasImage ? 1 : 0))
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-3 w-full" />
          ))}
      </div>

      {/* Table rows */}
      <div className="space-y-3">
        {Array(rowCount)
          .fill(0)
          .map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid items-center"
              style={{
                gridTemplateColumns: `${hasIndex ? "40px " : ""}${hasImage ? "40px " : ""}repeat(${columnCount - (hasIndex ? 1 : 0) - (hasImage ? 1 : 0)}, 1fr)`,
              }}
            >
              {hasIndex && <Skeleton className="h-3 w-4 mx-auto" />}
              {hasImage && <Skeleton className="h-7 w-7 rounded" />}
              {Array(columnCount - (hasIndex ? 1 : 0) - (hasImage ? 1 : 0))
                .fill(0)
                .map((_, colIndex) => (
                  <Skeleton
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`h-4 ${colIndex === 0 ? "w-[180px]" : colIndex === columnCount - 1 ? "w-12 ml-auto" : "w-[120px]"}`}
                  />
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}
