import { useThreadsContext } from "@/contexts/ThreadContext";
import { useEffect } from "react";
import { InboxItem } from "./inbox-item";
import { EmailRenderer } from "./email-renderer";
import { StateView } from "./state-view";

export function Inbox() {
  const { threadInterrupts, loading, fetchThreads } = useThreadsContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threadInterrupts.length || loading) return;
    fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="flex flex-col gap-3 items-start">
      {threadInterrupts.map((interruptData, idx) => {
        return (
          <InboxItem
            key={`inbox-item-${idx}`}
            interruptData={interruptData}
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
