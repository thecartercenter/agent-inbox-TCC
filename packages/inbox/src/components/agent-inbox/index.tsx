import React from "react";
import { Inbox } from "./inbox";
import { ThreadsProvider } from "./contexts/ThreadContext";

export interface AgentInboxProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {}

export function AgentInbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>(props: AgentInboxProps<ThreadValues>): React.ReactElement {
  return (
    <ThreadsProvider<ThreadValues>>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Inbox<ThreadValues> />
      </React.Suspense>
    </ThreadsProvider>
  );
}
