"use client";

import { TighterText } from "@/components/ui/header";
import { PillButton } from "@/components/ui/pill-button";
import { Inbox } from "@/components/v2";
import { SettingsPopover } from "@/components/v2/components/settings-popover";
import { useQueryParams } from "@/components/v2/hooks/use-query-params";
import { ThreadValues } from "@/components/v2/types";
import { ThreadsProvider } from "@/contexts/ThreadContext";
import { ThreadStatus } from "@langchain/langgraph-sdk";
import React from "react";

export default function DemoPage() {
  const { searchParams, updateQueryParam } = useQueryParams();
  const [selectedInbox, setSelectedInbox] =
    React.useState<ThreadStatus>("interrupted");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const currentInbox = searchParams.get("inbox") as
      | ThreadStatus
      | null
      | undefined;
    if (!currentInbox) {
      updateQueryParam("inbox", selectedInbox);
    } else {
      setSelectedInbox(currentInbox);
    }
  }, [searchParams]);

  const changeInbox = (inbox: ThreadStatus) => {
    updateQueryParam("inbox", inbox);
    setSelectedInbox(inbox);
  };

  return (
    <ThreadsProvider<ThreadValues>>
      <React.Suspense fallback={<div>Loading...</div>}>
        <div className="w-full max-h-screen py-10 px-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex items-center justify-between pt-6 pr-20 w-1/2">
            <TighterText className="text-3xl font-medium">Inbox</TighterText>
            <SettingsPopover />
          </div>
          <div className="flex gap-2 items-center justify-start mt-5">
            <PillButton
              onClick={() => changeInbox("interrupted")}
              variant={selectedInbox === "interrupted" ? "default" : "outline"}
            >
              Interrupted
            </PillButton>
            <PillButton
              onClick={() => changeInbox("idle")}
              variant={selectedInbox === "idle" ? "default" : "outline"}
            >
              Idle
            </PillButton>
            <PillButton
              onClick={() => changeInbox("busy")}
              variant={selectedInbox === "busy" ? "default" : "outline"}
            >
              Busy
            </PillButton>
            <PillButton
              onClick={() => changeInbox("error")}
              variant={selectedInbox === "error" ? "default" : "outline"}
            >
              Error
            </PillButton>
          </div>
          <div className="my-5">
            <Inbox<ThreadValues> selectedInbox={selectedInbox} />
          </div>
        </div>
      </React.Suspense>
    </ThreadsProvider>
  );
}
