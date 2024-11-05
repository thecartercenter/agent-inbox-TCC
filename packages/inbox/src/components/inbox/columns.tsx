"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Email } from "./types";
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

export const columns: ColumnDef<Email>[] = [
  {
    accessorKey: "status",
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
      const status = row.getValue<Email["status"]>("status");

      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: "subject",
    header: () => <TighterText className="text-left">Subject</TighterText>,
    cell: ({ row }) => {
      const subject = row.getValue<string>("subject");
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
      const fromEmail = row.getValue<string>("from_email");
      return <p>{fromEmail}</p>;
    },
  },
  {
    accessorKey: "page_content",
    header: () => <TighterText className="text-left">Content</TighterText>,
    cell: ({ row }) => {
      const content = row.getValue<string>("page_content");
      return (
        <div className="max-w-sm">
          <p className="text-pretty line-clamp-2">{content}</p>
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
          className="flex ml-auto"
        >
          <TighterText>Sent Date</TighterText>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sendTime = row.getValue<string | undefined>("send_time");
      if (!sendTime) {
        return <p className="text-right">-</p>;
      }
      try {
        const date = new Date(sendTime);
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
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
