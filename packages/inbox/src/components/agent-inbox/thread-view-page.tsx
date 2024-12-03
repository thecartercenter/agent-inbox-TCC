import { Thread } from "@langchain/langgraph-sdk";
import { StateView } from "./components/state-view";
import { ThreadActionsView } from "./components/thread-actions-view";
import { useThreadsContext } from "./contexts/ThreadContext";
import { HumanInterrupt, ThreadData } from "./types";
import React from "react";

export function ThreadViewPage<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadId }: { threadId: string }) {
  const { fetchSingleThread } = useThreadsContext<ThreadValues>();
  const [threadData, setThreadData] =
    React.useState<ThreadData<ThreadValues>>();

  React.useEffect(() => {
    fetchSingleThread(threadId).then((data) => {
      setThreadData(data as ThreadData<ThreadValues>);
    });
  }, []);

  if (!threadData) {
    return <div>Thread not found for ID: {threadId}</div>;
  }
  if (threadData.status !== "interrupted") {
    return <div>Thread is not of status interrupted</div>;
  }
  if (!threadData.interrupts || threadData.interrupts.length === 0) {
    return <div>Thread has no interrupts</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex w-1/2">
        <ThreadActionsView<ThreadValues>
          threadData={
            threadData as {
              thread: Thread<ThreadValues>;
              status: "interrupted";
              interrupts: HumanInterrupt[];
            }
          }
          setThreadData={setThreadData}
        />
      </div>
      <div className="flex w-1/2 min-h-screen">
        <StateView threadData={threadData} />
      </div>
    </div>
  );
}
