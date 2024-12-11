"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings } from "lucide-react";
import React from "react";
import { PillButton } from "@/components/ui/pill-button";
import { AddAgentInboxDialog } from "./add-agent-inbox-dialog";

export function SettingsPopover() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <PillButton
            variant="outline"
            className="flex gap-2 items-center justify-center text-gray-800 w-fit"
            size="lg"
          >
            <Settings />
            <span>Settings</span>
          </PillButton>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Settings</h4>
              <p className="text-sm text-muted-foreground">
                Configuration settings for Agent Inbox
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 w-full">
              <AddAgentInboxDialog
                closeSettingsPopover={() => setOpen(false)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
