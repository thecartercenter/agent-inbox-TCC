"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ThreadInterruptData } from "./types";
import { StatusBadge } from "./status";
import { TighterText } from "@/components/ui/header";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * This function is used to return the core values from the row data
 * (content, from email, subject, and thread id) to be used for filtering.
 */
const accessorFn = (row: ThreadInterruptData) => {
  const { thread_id } = row;
  const { page_content, from_email, subject } = row.thread.values.email;
  return `${page_content} ${from_email} ${subject} ${thread_id}`;
};

export const columns: ColumnDef<ThreadInterruptData>[] = [
  {
    accessorFn: (row) => row.interrupt_value?.type,
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex w-full mr-auto items-center justify-start hover:bg-inherit px-2"
        >
          <TighterText className="text-left">Status</TighterText>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { type } = row.original.interrupt_value || { type: "none" as any };
      return <StatusBadge type={type} />;
    },
  },
  {
    accessorKey: "subject",
    header: () => <TighterText className="text-left">Subject</TighterText>,
    cell: ({ row }) => {
      const {
        email: { subject },
      } = row.original.thread.values;
      return (
        <div className="max-w-56">
          <p className="truncate ...">{subject}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "from_email",
    header: () => <TighterText className="text-left">From</TighterText>,
    cell: ({ row }) => {
      const {
        email: { from_email },
      } = row.original.thread.values;
      return <p>{from_email}</p>;
    },
  },
  {
    accessorFn,
    accessorKey: "page_content",
    header: () => <TighterText className="text-left">Content</TighterText>,
    cell: ({ row }) => {
      const {
        email: { page_content },
      } = row.original.thread.values;
      return (
        <div className="max-w-sm">
          <p className="text-pretty line-clamp-2">{page_content}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "send_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-end ml-auto"
        >
          <TighterText>Sent Date</TighterText>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const {
        email: { send_time },
      } = row.original.thread.values;
      if (!send_time) {
        return <p className="text-right">-</p>;
      }
      try {
        const date = new Date(send_time);
        return <p className="text-right">{format(date, "MM/dd/yyyy HH:mm")}</p>;
      } catch (e) {
        console.error("Failed to parse date", e);
        return <p className="text-right">-</p>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { thread_id } = row.original;

      const handleIgnore = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => {
        e.preventDefault();
        console.log("TODO: implement ignore");
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-menu-content">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(thread_id);
                }}
              >
                Copy thread ID
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={handleIgnore}
              >
                Ignore
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
