"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  // Server-side pagination
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Client-side pagination
  clientPagination?: boolean;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pageCount,
  currentPage = 1,
  onPageChange,
  clientPagination = false,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(clientPagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: {
        pagination: { pageSize },
      },
    }),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    ...(pageCount && {
      pageCount,
      manualPagination: true,
    }),
  });

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-xs md:text-sm whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs md:text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">No data found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(pageCount || clientPagination) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {clientPagination
              ? `Showing ${table.getRowModel().rows.length} of ${data.length} results`
              : `Page ${currentPage} of ${pageCount}`}
          </p>
          <div className="flex items-center justify-between gap-1 md:gap-2 flex-wrap">
            <span className="text-xs md:text-sm text-muted-foreground">
              {clientPagination
                ? `Page ${table.getState().pagination.pageIndex + 1}`
                : `Page ${currentPage}`}
            </span>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  clientPagination
                    ? table.previousPage()
                    : onPageChange?.(currentPage - 1)
                }
                disabled={
                  clientPagination
                    ? !table.getCanPreviousPage()
                    : currentPage <= 1
                }
                className="h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  clientPagination
                    ? table.nextPage()
                    : onPageChange?.(currentPage + 1)
                }
                disabled={
                  clientPagination
                    ? !table.getCanNextPage()
                    : currentPage >= (pageCount || 1)
                }
                className="h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
