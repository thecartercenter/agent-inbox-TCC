"use client";

import { useEffect, useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { TextSearchFunction } from "./text-search-filter";
import { EmailSheet } from "./email-sheet";
import { LastSynced } from "./last-synced";
import { useThreads } from "@/hooks/use-threads/useThreads";
import { columns } from "@/components/inbox/columns";
import { Thread } from "@langchain/langgraph-sdk";
import { ThreadValues } from "./types";
import React from "react";

interface DataTableProps {
  threads: Thread<ThreadValues>[];
  loading: boolean;
  fetchThreads: () => Promise<void>;
}

function DataTableComponent({
  threads,
  loading,
  fetchThreads,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const tableData = React.useMemo(
    () => threads.map((t) => t.values),
    [threads]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="p-1">
      <div className="flex items-center justify-between">
        <div className="flex w-full mr-auto">
          <TextSearchFunction table={table} />
        </div>
        <div className="flex w-full ml-auto">
          <LastSynced loading={loading} fetchData={fetchThreads} />
        </div>
      </div>

      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length > 0 &&
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <EmailSheet key={row.original.email.id} row={row} />
                  ))}
              {!table.getRowModel().rows?.length && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    You're all caught up!
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DataTable = React.memo(DataTableComponent);
