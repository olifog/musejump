import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T = any> {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (value: any, item: T, index: number) => ReactNode;
}

interface TrackTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  rowClassName?: string;
  cellClassName?: string;
  headerClassName?: string;
}

export const TrackTable = <T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  rowClassName,
  cellClassName,
  headerClassName,
}: TrackTableProps<T>) => {
  // Helper to generate alignment classes
  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  return (
    // Removed the outer scrolling div, parent should handle scroll
    <Table>
      <TableHeader>
        <TableRow className={cn("hover:bg-transparent", headerClassName)}>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                getAlignmentClass(column.align),
                // Apply default padding, allow override via column.className
                column.align === "right" ? "pr-1" : "",
                column.key === "track" && column.align !== "right" && column.align !== "center" ? "pl-1" : "", 
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={keyExtractor(item, index)} className={rowClassName}>
            {columns.map((column) => (
              <TableCell
                key={`${keyExtractor(item, index)}-${column.key}`}
                className={cn(
                  getAlignmentClass(column.align),
                   // Apply default padding, allow override via column.className or cellClassName
                  column.align === "right" ? "pr-1" : "",
                  column.key === "track" && column.align !== "right" && column.align !== "center" ? "pl-1" : "", 
                  column.className,
                  cellClassName
                )}
              >
                {column.render
                  ? column.render(item[column.key], item, index)
                  : item[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
