import { Table } from "@tanstack/react-table";
import { ActionType, ThreadInterruptData } from "./types";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { TighterText } from "../ui/header";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "./status";
import { Input } from "../ui/input";

interface FilterComponentProps {
  table: Table<ThreadInterruptData>;
}

export function FilterComponent({ table }: FilterComponentProps) {
  const [filterBy, setFilterBy] = useState<ActionType>();
  const [open, setOpen] = useState(false);

  const handleSetFilterBy = (value: ActionType | "reset") => {
    if (value === "reset") {
      table.setColumnFilters([]);
      setFilterBy(undefined);
      return;
    }

    table.setColumnFilters([
      {
        id: "status",
        value,
      },
    ]);
    setFilterBy(value);
  };

  return (
    <div className="flex items-center py-4 gap-2 w-full">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-[220px]"
          >
            <TighterText className="flex items-center justify-start gap-1 text-left">
              Filter by {filterBy && <StatusBadge type={filterBy} />}
            </TighterText>
            {open ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuItem
            onClick={() => handleSetFilterBy("reset")}
            className="px-4"
          >
            Reset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy(ActionType.EDIT)}>
            <StatusBadge type={ActionType.EDIT} />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy(ActionType.ADD)}>
            <StatusBadge type={ActionType.ADD} />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSetFilterBy(ActionType.NOTIFY)}
          >
            <StatusBadge type={ActionType.NOTIFY} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        isSearch
        placeholder="Search"
        value={
          (table.getColumn("page_content")?.getFilterValue() as string) ?? ""
        }
        onChange={(event) => {
          const pageContentColumn = table.getColumn("page_content");
          if (!pageContentColumn) {
            console.error("pageContentColumn not defined");
            return;
          }
          pageContentColumn.setFilterValue(event.target.value);
        }}
      />
    </div>
  );
}
