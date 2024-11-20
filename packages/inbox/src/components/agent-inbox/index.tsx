import React from "react";
import { Inbox } from "./inbox";
import { ThreadsProvider } from "./contexts/ThreadContext";

export function AgentInbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>(): React.ReactElement {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ThreadsProvider<ThreadValues>>
        <Inbox<ThreadValues> />
      </ThreadsProvider>
    </React.Suspense>
  );
}
