import { ReactNode } from "react";

interface Column {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (value: any, item: any, index: number) => ReactNode;
}

interface TrackTableProps {
  data: any[];
  columns: Column[];
  keyExtractor: (item: any, index: number) => string;
}

export const TrackTable = ({
  data,
  columns,
  keyExtractor,
}: TrackTableProps) => {
  return (
    <div className="overflow-y-auto max-h-[70vh]">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-2 ${
                  column.align === "right"
                    ? "text-right pr-1"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left" + (column.key === "track" ? " pl-1" : "")
                } ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((item, index) => (
            <tr key={keyExtractor(item, index)} className="hover:bg-gray-700">
              {columns.map((column) => (
                <td
                  key={`${keyExtractor(item, index)}-${column.key}`}
                  className={`py-1.5 ${
                    column.align === "right"
                      ? "text-right pr-1"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left" + (column.key === "track" ? " pl-1" : "")
                  } ${column.className || ""}`}
                >
                  {column.render
                    ? column.render(item[column.key], item, index)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
