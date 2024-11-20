import { ThreadDataV2 } from "../types";
import React from "react";
import { useQueryParams } from "../hooks/use-query-params";
import { ThreadStatus } from "@langchain/langgraph-sdk";
import { InterruptedInboxItem } from "./interrupted-inbox-item";
import { GenericInboxItem } from "./generic-inbox-item";

interface InboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: ThreadDataV2<ThreadValues>;
  threadContextRenderer?: React.ReactNode;
}

export function InboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData }: InboxItemProps<ThreadValues>) {
  const { searchParams } = useQueryParams();

  const inbox =
    (searchParams.get("inbox") as ThreadStatus | null | undefined) ||
    ("interrupted" as ThreadStatus);

  if (inbox === "interrupted" && threadData.status === "interrupted") {
    return <InterruptedInboxItem threadData={threadData} />;
  }

  if (inbox !== "interrupted" && threadData.status !== "interrupted") {
    console.log("inbox and status not interrupted", threadData);
    return <GenericInboxItem threadData={threadData} />;
  }

  return null;
}
