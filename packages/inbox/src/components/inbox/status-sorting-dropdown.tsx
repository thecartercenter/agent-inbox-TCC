import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Button } from "../ui/button";
import { TighterText } from "../ui/header";
import { ChevronDown, ChevronUp } from "lucide-react";

export function StatusSortingDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <TighterText className="text-left">Status</TighterText>
          {open ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort by:</DropdownMenuLabel>
        <DropdownMenuItem>Human in the Loop</DropdownMenuItem>
        <DropdownMenuItem>Done</DropdownMenuItem>
        <DropdownMenuItem>Processing</DropdownMenuItem>
        <DropdownMenuItem>In Queue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
