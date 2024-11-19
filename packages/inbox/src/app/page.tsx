"use client";

import { TighterText } from "@/components/ui/header";
import { Inbox } from "@/components/v2";
import { SettingsPopover } from "@/components/v2/components/settings-popover";
import { ThreadValues } from "@/components/v2/types";
import { ThreadsProvider } from "@/contexts/ThreadContext";
import React, { Suspense } from "react";

export default function DemoPage() {
  return (
    <ThreadsProvider<ThreadValues>>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full max-h-screen py-10 px-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex items-center justify-between pt-6 pr-20 w-1/2">
            <TighterText className="text-3xl font-medium">Inbox</TighterText>
            <SettingsPopover />
          </div>
          {/* TODO: Hookup different inbox types */}
          {/* <div className="flex gap-2 items-center justify-start">
          <PillButton
            onClick={() => setSelectedInbox("all")}
            variant={selectedInbox === "all" ? "default" : "outline"}
          >
            All
          </PillButton>
          <PillButton
            onClick={() => setSelectedInbox("unread")}
            variant={selectedInbox === "unread" ? "default" : "outline"}
          >
            Unread
          </PillButton>
        </div> */}
          <div className="my-5">
            <Inbox<ThreadValues> />
          </div>
        </div>
      </Suspense>
    </ThreadsProvider>
  );
}
