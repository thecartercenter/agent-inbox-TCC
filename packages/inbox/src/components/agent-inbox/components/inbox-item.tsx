import { ThreadData } from "../types";
import React from "react";
import { useQueryParams } from "../hooks/use-query-params";
import { ThreadStatus } from "@langchain/langgraph-sdk";
import { InterruptedInboxItem } from "./interrupted-inbox-item";
import { GenericInboxItem } from "./generic-inbox-item";

interface InboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: ThreadData<ThreadValues>;
}

export function InboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData }: InboxItemProps<ThreadValues>) {
  const { searchParams } = useQueryParams();

  const inbox =
    (searchParams.get("inbox") as ThreadStatus | "all" | null | undefined) ||
    ("interrupted" as ThreadStatus | "all");

  if (inbox === "all") {
    if (threadData.status === "interrupted") {
      return <InterruptedInboxItem threadData={threadData} />;
    } else {
      return <GenericInboxItem threadData={threadData} />;
    }
  }

  if (inbox === "interrupted" && threadData.status === "interrupted") {
    return <InterruptedInboxItem threadData={threadData} />;
  }

  if (inbox !== "interrupted" && threadData.status !== "interrupted") {
    return <GenericInboxItem threadData={threadData} />;
  }

  return null;
}
