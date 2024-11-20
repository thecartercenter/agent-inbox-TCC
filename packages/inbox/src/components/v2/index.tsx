import { useThreadsContext } from "@/contexts/ThreadContext";
import { useEffect } from "react";
import { InboxItem } from "./components/inbox-item";
import { StateView } from "./components/state-view";
import { ThreadStatus } from "@langchain/langgraph-sdk";

export function Inbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ selectedInbox }: { selectedInbox: ThreadStatus }) {
  const {
    threadInterrupts,
    loading,
    fetchThreads,
    fetchThreadsV2,
    threadData,
  } = useThreadsContext<ThreadValues>();

  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (threadInterrupts.length || loading) return;
  //   fetchThreads();
  // }, [fetchThreads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threadData.length || loading) return;
    fetchThreadsV2();
  }, [fetchThreadsV2]);

  return (
    <div className="flex flex-col gap-3 items-start w-full">
      {threadData
        .filter((t) => t.status === selectedInbox)
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
  );
}
