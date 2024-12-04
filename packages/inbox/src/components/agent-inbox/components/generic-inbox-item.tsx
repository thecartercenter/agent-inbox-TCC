import { cn } from "@/lib/utils";
import { Thread } from "@langchain/langgraph-sdk";
import React from "react";
import { ThreadIdCopyable } from "./thread-id";
import { InboxItemStatuses } from "./statuses";
import { format } from "date-fns";

interface GenericInboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "idle" | "busy" | "error" | "interrupted";
    interrupts?: never | undefined;
  };
  isLast: boolean;
}

export function GenericInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData, isLast }: GenericInboxItemProps<ThreadValues>) {
  const actionColorMap = {
    idle: {
      bg: "#E5E7EB",
      border: "#D1D5DB",
    },
    interrupted: {
      bg: "#b4faed",
      border: "#2ffad4",
    },
    busy: {
      bg: "#FDE68A",
      border: "#FCD34D",
    },
    error: {
      bg: "#FECACA",
      border: "#F87171",
    },
  };
  const actionColor = actionColorMap[threadData.status];
  const actionLetter = threadData.status[0].toUpperCase();

  const updatedAtDateString = format(
    new Date(threadData.thread.updated_at),
    "MM/dd"
  );

  return (
    <div
      className={cn(
        "grid grid-cols-12 w-full px-4 py-6 items-center",
        !isLast && "border-b-[1px] border-gray-200"
      )}
    >
      <div className="col-span-9 flex items-center justify-start gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
          style={{
            backgroundColor: actionColor.bg,
            borderWidth: "1px",
            borderColor: actionColor.border,
          }}
        >
          {actionLetter}
        </div>
        <p className="font-semibold text-black">Thread ID:</p>
        <ThreadIdCopyable threadId={threadData.thread.thread_id} />
      </div>

      <div className="col-span-2">
        <InboxItemStatuses status={threadData.status} />
      </div>

      <p className="col-span-1 text-gray-500">{updatedAtDateString}</p>
    </div>
  );
}
