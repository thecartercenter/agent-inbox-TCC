"use client";

import { Row, flexRender } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThreadValues } from "./types";
import { TableCell, TableRow } from "../ui/table";
import React, { useState } from "react";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { mapToolCallToString } from "./utils";
import { Button } from "../ui/button";

interface EmailSheetProps {
  row: Row<ThreadValues>;
}

export function EmailSheetComponent({ row }: EmailSheetProps) {
  const [open, setOpen] = useState(false);
  const rowData = row.original;
  const lastMessage = rowData.messages[
    rowData.messages.length - 1
  ] as BaseMessage & { type: string };
  const toolCall =
    lastMessage.type === "ai" && (lastMessage as AIMessage)?.tool_calls?.[0]
      ? (lastMessage as AIMessage).tool_calls?.[0]
      : undefined;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TableRow
          data-state={row.getIsSelected() && "selected"}
          onClick={() => setOpen(true)}
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
        className="min-w-[80vw]"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{rowData.email.subject}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <Label>From:</Label>
            <pre>{rowData.email.from_email}</pre>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <Label>To:</Label>
            <pre>{rowData.email.to_email}</pre>
          </div>
          <div className="flex flex-col items-start justify-start gap-2">
            <Label>Body:</Label>
            <p className="text-gray-600 max-w-[75%] text-pretty">
              {rowData.email.page_content}
            </p>
          </div>
          {toolCall && (
            <>
              <div className="flex flex-col items-start justify-start gap-2">
                <Label>{toolCall.name}</Label>
              </div>
              <p className="text-gray-600 max-w-[75%] text-pretty">
                {mapToolCallToString(toolCall)}
              </p>
            </>
          )}
        </div>
        <SheetFooter className="flex h-full mt-auto">
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const EmailSheet = React.memo(EmailSheetComponent);
