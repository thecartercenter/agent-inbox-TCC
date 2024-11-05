"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
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
import { Email, InboxType } from "./types";
import { TextSearchFunction } from "./text-search-filter";
import { InboxList } from "./inbox-list";
import { EmailSheet } from "./email-sheet";

interface DataTableProps<TValue> {
  columns: ColumnDef<Email, TValue>[];
  data: Email[];
}

function filterInbox(data: Email[], inbox: InboxType): Email[] {
  if (inbox === "all") {
    return data;
  }
  if (inbox === "read") {
    return data.filter((email) => email.read);
  }
  if (inbox === "unread") {
    return data.filter((email) => !email.read);
  }
  if (inbox === "running") {
    return data.filter((email) => email.status === "processing");
  }
  if (inbox === "hitl") {
    return data.filter((email) => email.status === "hitl");
  }
  return data;
}

export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedInbox, setSelectedInbox] = useState<InboxType>("hitl");
  const [renderedData, setRenderedData] = useState<Email[]>(data);

  useEffect(() => {
    setRenderedData(filterInbox(data, selectedInbox));
  }, [selectedInbox]);

  const table = useReactTable({
    data: renderedData,
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
      <div className="w-full">
        <TextSearchFunction table={table} />
      </div>
      <div className="flex items-start justify-start">
        <div className="pr-2">
          <InboxList
            selectedInbox={selectedInbox}
            setSelectedInbox={setSelectedInbox}
          />
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
                    .rows.map((row) => <EmailSheet key={row.id} row={row} />)}
                {!table.getRowModel().rows?.length &&
                  selectedInbox === "hitl" && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        You're all caught up!
                      </TableCell>
                    </TableRow>
                  )}
                {!table.getRowModel().rows?.length &&
                  selectedInbox !== "hitl" && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No emails found.
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
    </div>
  );
}
