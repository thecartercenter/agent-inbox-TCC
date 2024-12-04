import { cn } from "@/lib/utils";
import { HumanInterrupt } from "../types";
import React from "react";
import { prettifyText } from "../utils";
import { InboxItemStatuses } from "./statuses";
import { Thread } from "@langchain/langgraph-sdk";
import NextLink from "next/link";
import { format } from "date-fns";

interface InterruptedInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "interrupted";
    interrupts: HumanInterrupt[];
  };
  isLast: boolean;
}

export function InterruptedInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData, isLast }: InterruptedInboxItem<ThreadValues>) {
  const actionTypeColorMap = {
    question: { bg: "#FCA5A5", border: "#EF4444" },
    notify: { bg: "#93C5FD", border: "#3B82F6" },
  };
  const actionType = threadData.interrupts[0].action_request.action;
  const actionColor =
    actionType.toLowerCase() in actionTypeColorMap
      ? actionTypeColorMap[
          actionType.toLowerCase() as keyof typeof actionTypeColorMap
        ]
      : { bg: "#FDBA74", border: "#F97316" };
  const actionLetter = actionType.slice(0, 1).toUpperCase();

  const descriptionPreview =
    threadData.interrupts[0].description &&
    threadData.interrupts[0].description.slice(0, 75);
  const descriptionTruncated =
    threadData.interrupts[0].description &&
    threadData.interrupts[0].description.length > 75;

  const updatedAtDateString = format(
    new Date(threadData.thread.updated_at),
    "MM/dd"
  );

  return (
    <NextLink
      href={`/thread/${threadData.thread.thread_id}`}
      className={cn(
        "grid grid-cols-12 w-full px-4 py-6 items-center",
        !isLast &&
          "border-b-[1px] border-gray-200 hover:bg-gray-50/90 transition-colors ease-in-out"
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
        <p className="font-semibold text-black">
          {prettifyText(threadData.interrupts[0].action_request.action)}
        </p>
        {descriptionPreview && (
          <p className="text-sm text-gray-500">{`${descriptionPreview}${descriptionTruncated ? "..." : ""}`}</p>
        )}
      </div>

      <div className="col-span-2">
        <InboxItemStatuses config={threadData.interrupts[0].config} />
      </div>

      <p className="col-span-1 text-gray-500">{updatedAtDateString}</p>
    </NextLink>
  );
}
