import { Table } from "@tanstack/react-table";
import { ThreadValues } from "./types";
import { Input } from "../ui/input";
import { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { TighterText } from "../ui/header";
import { ChevronDown, ChevronUp } from "lucide-react";

const columnToLabel = (column: string) => {
  switch (column) {
    case "from_email":
      return "emails";
    case "subject":
      return "subjects";
    case "page_content":
      return "contents";
    case "send_time":
      return "send times";
    case "status":
      return "statuses";
  }
};

function StatusFilter({
  filterByValue,
  setFilterByValue,
}: {
  filterByValue: string;
  setFilterByValue: Dispatch<SetStateAction<string>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px]">
          <TighterText className="text-left">
            Filter by NOT IMPLEMENTED
          </TighterText>
          {open ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuItem onClick={() => setFilterByValue("in-queue")}>
          In Queue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilterByValue("processing")}>
          Processing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilterByValue("hitl")}>
          Human in the Loop
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFilterByValue("done")}>
          Done
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TextSearchFunction({ table }: { table: Table<ThreadValues> }) {
  const [filterBy, setFilterBy] = useState<string>("from_email");
  const [filterByValue, setFilterByValue] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleSetFilterBy = (value: string) => {
    table.resetColumnFilters();
    setFilterBy(value);
  };

  return (
    <div className="flex items-center py-4 gap-2 w-full">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px]">
            <TighterText className="text-left">
              Filter by {columnToLabel(filterBy)}
            </TighterText>
            {open ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuItem onClick={() => handleSetFilterBy("from_email")}>
            Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy("subject")}>
            Subject
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy("page_content")}>
            Content
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy("send_time")}>
            Send Time
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetFilterBy("status")}>
            Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {filterBy === "status" && (
        <StatusFilter
          filterByValue={filterByValue}
          setFilterByValue={(v) => {
            setFilterByValue(v);
            table.getColumn(filterBy)?.setFilterValue(v);
          }}
        />
      )}
      {filterBy !== "status" && (
        <Input
          placeholder={`Filter ${columnToLabel(filterBy)}...`}
          value={(table.getColumn(filterBy)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterBy)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}
    </div>
  );
}
