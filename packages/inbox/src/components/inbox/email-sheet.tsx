"use client";

import { Row, flexRender } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Email } from "./types";
import { TableCell, TableRow } from "../ui/table";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

interface EmailSheetProps {
  row: Row<Email>;
}

export function EmailSheet({ row }: EmailSheetProps) {
  const [open, setOpen] = useState(false);
  const rowData = row.original;

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
      <SheetContent side="right" className="min-w-[80vw]">
        <SheetHeader>
          <SheetTitle>{rowData.subject}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <Label>From:</Label>
            <pre>{rowData.from_email}</pre>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <Label>To:</Label>
            <pre>{rowData.to_email}</pre>
          </div>
          <div className="flex flex-col items-start justify-start gap-2">
            <Label>Body:</Label>
            <p className="text-gray-600 max-w-[75%] text-pretty">
              {rowData.page_content}
            </p>
          </div>
        </div>
        {/* <SheetFooter className="flex h-full mt-auto">
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
