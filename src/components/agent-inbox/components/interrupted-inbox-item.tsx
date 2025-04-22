import { cn } from "@/lib/utils";
import { HumanInterrupt } from "../types";
import React from "react";
import { InboxItemStatuses } from "./statuses";
import { Thread } from "@langchain/langgraph-sdk";
import { format } from "date-fns";
import { useQueryParams } from "../hooks/use-query-params";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";
import { Badge } from "@/components/ui/badge";

interface InterruptedInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "interrupted";
    interrupts?: HumanInterrupt[];
    invalidSchema?: boolean;
  };
  isLast: boolean;
  onThreadClick: (id: string) => void;
}

export const InterruptedInboxItem = <ThreadValues extends Record<string, any>>({
  threadData,
  isLast,
  onThreadClick,
}: InterruptedInboxItem<ThreadValues>) => {
  const { updateQueryParams } = useQueryParams();
  const firstInterrupt = threadData.interrupts?.[0];

  const descriptionPreview = firstInterrupt?.description?.slice(0, 65);
  const descriptionTruncated =
    firstInterrupt?.description && firstInterrupt.description.length > 65;

  const title = firstInterrupt?.action_request?.action ?? "Unknown Action";

  const updatedAtDateString = format(
    new Date(threadData.thread.updated_at),
    "MM/dd h:mm a"
  );

  const handleThreadClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default click behavior

    // Call the onThreadClick callback first to save scroll position
    if (onThreadClick) {
      onThreadClick(threadData.thread.thread_id);
    }

    // Navigate immediately using the NextJS router approach
    // The scroll option is set to false in updateQueryParams to prevent auto-scrolling
    updateQueryParams(
      VIEW_STATE_THREAD_QUERY_PARAM,
      threadData.thread.thread_id
    );
  };

  return (
    <div
      key={threadData.thread.thread_id}
      onClick={handleThreadClick}
      className={cn(
        "grid grid-cols-12 w-full p-4 items-center cursor-pointer hover:bg-gray-50",
        {
          "border-b border-gray-200": !isLast,
        }
      )}
    >
      {/* Column 1: Dot - adjusted span slightly */}
      <div className="col-span-1 flex justify-center">
        <div className="w-[6px] h-[6px] rounded-full bg-blue-400" />
      </div>

      {/* Column 2-9: Title and Description - merged spans */}
      <div className="col-span-8 overflow-hidden">
        <div className="flex items-center">
          <span className="text-sm font-semibold text-black truncate pr-1">
            {title}
          </span>
          {threadData.invalidSchema && (
            <Badge
              variant="outline"
              className="ml-1 flex-shrink-0 bg-destructive/10 text-destructive border-destructive/20"
            >
              Invalid Interrupt
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {descriptionPreview}
          {descriptionTruncated && "..."}
          {!firstInterrupt && threadData.invalidSchema && (
            <i>Invalid interrupt data - cannot display details.</i>
          )}
          {!firstInterrupt &&
            !threadData.invalidSchema &&
            !descriptionPreview && <i>No description provided.</i>}
        </div>
      </div>

      {/* Column 10: Statuses - adjusted span */}
      <div className="col-span-1">
        {firstInterrupt?.config && (
          <InboxItemStatuses config={firstInterrupt.config} />
        )}
      </div>

      {/* Column 11-12: Timestamp - adjusted span */}
      <p className="col-span-2 text-right text-sm text-gray-600 font-light">
        {updatedAtDateString}
      </p>
    </div>
  );
};
