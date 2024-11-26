import { HumanInterrupt, ThreadData, ThreadStatusWithAll } from "../types";
import React from "react";
import { useQueryParams } from "../hooks/use-query-params";
import { InterruptedInboxItem } from "./interrupted-inbox-item";
import { GenericInboxItem } from "./generic-inbox-item";
import { INBOX_PARAM } from "../constants";

interface InboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: ThreadData<ThreadValues>;
}

export function InboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData }: InboxItemProps<ThreadValues>) {
  const { searchParams } = useQueryParams();

  const inbox = (searchParams.get(INBOX_PARAM) ||
    "interrupted") as ThreadStatusWithAll;

  if (inbox === "all") {
    if (threadData.status === "interrupted") {
      if (threadData.interrupts?.length) {
        return (
          <InterruptedInboxItem
            threadData={
              threadData as ThreadData<ThreadValues> & {
                interrupts: HumanInterrupt[];
              }
            }
          />
        );
      } else {
        return (
          <GenericInboxItem
            threadData={
              threadData as ThreadData<ThreadValues> & { interrupts: undefined }
            }
          />
        );
      }
    } else {
      return <GenericInboxItem threadData={threadData} />;
    }
  }

  if (inbox === "interrupted" && threadData.status === "interrupted") {
    if (threadData.interrupts?.length) {
      return (
        <InterruptedInboxItem
          threadData={
            threadData as ThreadData<ThreadValues> & {
              interrupts: HumanInterrupt[];
            }
          }
        />
      );
    } else {
      return (
        <GenericInboxItem
          threadData={
            threadData as ThreadData<ThreadValues> & { interrupts: undefined }
          }
        />
      );
    }
  }

  if (inbox !== "interrupted" && threadData.status !== "interrupted") {
    return <GenericInboxItem threadData={threadData} />;
  }

  return null;
}
