import { useThreadsContext } from "@/contexts/ThreadContext";
import { useEffect } from "react";
import { InboxItem } from "./components/inbox-item";
import { StateView } from "./components/state-view";
import { ThreadStatus } from "@langchain/langgraph-sdk";
import React from "react";
import { useQueryParams } from "./hooks/use-query-params";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "./constants";
import { TighterText } from "../ui/header";
import { SettingsPopover } from "./components/settings-popover";
import { PillButton } from "../ui/pill-button";
import { ThreadData } from "./types";

export function Inbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>() {
  const { searchParams, updateQueryParam } = useQueryParams();
  const { loading, fetchThreads, threadData } =
    useThreadsContext<ThreadValues>();
  const [selectedInbox, setSelectedInbox] = React.useState<
    ThreadStatus | "all"
  >("interrupted");

  const shouldClearSelectedThread = (
    selectedThreadId: string | null,
    threads: ThreadData<ThreadValues>[],
    inboxStatus: ThreadStatus | "all"
  ) => {
    if (!selectedThreadId) return false;
    return !threads.find(
      (t) => t.thread.thread_id === selectedThreadId && t.status === inboxStatus
    );
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const currentInbox = searchParams.get("inbox") as ThreadStatus | null;
    const selectedThreadId = searchParams.get(VIEW_STATE_THREAD_QUERY_PARAM);

    if (!currentInbox) {
      // Set default inbox if none selected
      updateQueryParam("inbox", selectedInbox);
    } else {
      setSelectedInbox(currentInbox);
    }

    // Clear selected thread if it's not in the current inbox
    if (threadData.length && selectedThreadId) {
      const inboxToCheck = currentInbox || selectedInbox;
      if (
        shouldClearSelectedThread(selectedThreadId, threadData, inboxToCheck)
      ) {
        updateQueryParam(VIEW_STATE_THREAD_QUERY_PARAM);
      }
    }
  }, [searchParams]);

  const changeInbox = (inbox: ThreadStatus | "all") => {
    updateQueryParam("inbox", inbox);
    setSelectedInbox(inbox);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threadData.length || loading) return;
    fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="w-full max-h-screen py-10 px-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="flex items-center justify-between pt-6 pr-20 w-1/2">
        <TighterText className="text-3xl font-medium">Inbox</TighterText>
        <SettingsPopover />
      </div>
      <div className="flex gap-2 items-center justify-start mt-5">
        <PillButton
          onClick={() => changeInbox("all")}
          variant={selectedInbox === "all" ? "default" : "outline"}
        >
          All
        </PillButton>
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
        <div className="flex flex-col gap-3 items-start w-full">
          {threadData
            .filter((t) => {
              if (selectedInbox === "all") return true;
              return t.status === selectedInbox;
            })
            .map((threadData, idx) => {
              return (
                <InboxItem<ThreadValues>
                  key={`inbox-item-${idx}`}
                  threadData={threadData}
                  // threadContextRenderer={
                  //   <EmailRenderer values={interruptData.thread.values.email} />
                  // }
                />
              );
            })}
          <StateView />
        </div>
      </div>
    </div>
  );
}
