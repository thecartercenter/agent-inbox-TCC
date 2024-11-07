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
import { debounce } from "lodash";

interface FilterComponentProps {
  table: Table<ThreadInterruptData>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

export function FilterComponent({
  table,
  searchValue,
  setSearchValue,
}: FilterComponentProps) {
  const [filterBy, setFilterBy] = useState<ActionType>();
  const [inputValue, setInputValue] = useState(searchValue);
  const [open, setOpen] = useState(false);

  const debouncedSetSearchValue = React.useCallback(
    debounce((value: string) => {
      setSearchValue(value);
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedSetSearchValue(e.target.value);
  };

  const handleSetFilterBy = (value: ActionType) => {
    table.resetColumnFilters();
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
        value={inputValue}
        onChange={handleInputChange}
      />
    </div>
  );
}
