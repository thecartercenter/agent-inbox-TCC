"use client";

import { Row, flexRender } from "@tanstack/react-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ActionType, ThreadInterruptData } from "../types";
import { TableCell, TableRow } from "@/components/ui/table";
import React, { useState } from "react";
import { AddEventComponent } from "./add-event";
import { EditEventComponent } from "./edit-event";
import { NotifyEventComponent } from "./notify-event";
import { useThreadsContext } from "@/contexts/ThreadContext";

interface EmailSheetProps {
  row: Row<ThreadInterruptData>;
  excludeSelector?: string;
  toastCallback: ({
    title,
    description,
    variant,
  }: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
}

export function EmailSheetComponent({
  row,
  excludeSelector,
  toastCallback,
}: EmailSheetProps) {
  const { updateState } = useThreadsContext();
  const [open, setOpen] = useState(false);

  const {
    interrupt_value: interruptValue,
    thread_id: threadId,
    thread,
  } = row.original;

  const handleTableRowClick = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => {
    e.preventDefault();
    // Check if the click occurred within the dropdown menu
    if (
      excludeSelector &&
      document.querySelector(excludeSelector)?.contains(e.target as Node)
    ) {
      return; // Don't open sheet if clicking within dropdown
    }
    setOpen(true);
  };

  const handleSubmitAddEvent = async (addValues: Record<string, any>) => {
    setOpen(false);

    try {
      await updateState(threadId, addValues, "human_node");

      toastCallback({
        title: "Success",
        description: "Added event.",
      });
      console.log("After toast");
    } catch (e) {
      console.error("Error adding event", e);
      toastCallback({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const handleSubmitEditEvent = async (addValues: Record<string, any>) => {
    setOpen(false);

    try {
      await updateState(threadId, addValues, "human_node");

      toastCallback({
        title: "Success",
        description: "Submitted event.",
      });
    } catch (e) {
      console.error("Error editing event", e);
      toastCallback({
        title: "Error",
        description: "Failed to submit event",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TableRow
          data-state={row.getIsSelected() && "selected"}
          onClick={handleTableRowClick}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col h-full min-w-[50vw]"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{thread.values.email.subject}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-start gap-1 text-sm">
            <pre>{thread.values.email.from_email}</pre>
            <div className="flex flex-row items-center justify-start gap-1">
              <p>to</p>
              <pre>{thread.values.email.to_email}</pre>
            </div>
          </div>

          <p className="max-w-[75%] text-pretty">
            {thread.values.email.page_content}
          </p>
          <hr />

          {interruptValue?.type === ActionType.ADD && (
            <AddEventComponent
              event={interruptValue}
              thread={thread}
              handleSubmit={handleSubmitAddEvent}
            />
          )}
          {interruptValue?.type === ActionType.EDIT && (
            <EditEventComponent
              event={interruptValue}
              thread={thread}
              handleSubmit={handleSubmitEditEvent}
            />
          )}
          {interruptValue?.type === ActionType.NOTIFY && (
            <NotifyEventComponent event={interruptValue} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const EmailSheet = React.memo(EmailSheetComponent);
