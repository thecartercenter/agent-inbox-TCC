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
import { FilterComponent } from "./text-search-filter";
import { LastSynced } from "./last-synced";
import { columns } from "@/components/inbox/columns";
import { ThreadInterruptData } from "./types";
import React from "react";
import { EmailSheet } from "./email-sheet";
import { useThreadsContext } from "@/contexts/ThreadContext";
import { useToast } from "@/hooks/use-toast";

function DataTableComponent() {
  const { toast } = useToast();
  const { threadInterrupts, loading, fetchThreads } = useThreadsContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threadInterrupts.length || loading) return;
    fetchThreads();
  }, [fetchThreads]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [lastSynced, setLastSynced] = useState<Date>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threadInterrupts.length && !lastSynced) {
      setLastSynced(new Date());
    } else if (!threadInterrupts.length && !lastSynced && !loading) {
      setLastSynced(new Date());
    }
  }, [threadInterrupts]);

  const table = useReactTable<ThreadInterruptData>({
    data: threadInterrupts,
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
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  useEffect(() => {
    table.reset();
  }, [threadInterrupts, table]);

  return (
    <div className="p-1">
      <div className="flex items-center justify-between">
        <div className="flex w-full mr-auto">
          <FilterComponent
            searchValue={globalFilter}
            setSearchValue={setGlobalFilter}
            table={table}
          />
        </div>
        <div className="flex w-full ml-auto">
          <LastSynced
            lastSynced={lastSynced}
            setLastSynced={setLastSynced}
            loading={loading}
            fetchData={fetchThreads}
          />
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
                table.getRowModel().rows.map((row) => (
                  <EmailSheet
                    toastCallback={() => {
                      setTimeout(() => {
                        toast({
                          title: "Success",
                        });
                      }, 1000);
                    }}
                    key={row.original.thread_id}
                    row={row}
                    excludeSelector=".dropdown-menu-content"
                  />
                ))}
              {!table.getRowModel().rows?.length && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    You&apos;re all caught up!
                  </TableCell>
                </TableRow>
              )}
              {loading && !table.getRowModel().rows?.length && (
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
