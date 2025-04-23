import { cn } from "@/lib/utils";
import { Thread } from "@langchain/langgraph-sdk";
import { ThreadIdCopyable } from "./thread-id";
import { InboxItemStatuses } from "./statuses";
import { format } from "date-fns";
import { useQueryParams } from "../hooks/use-query-params";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";
import { GenericThreadData } from "../types";

interface GenericInboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData:
    | GenericThreadData<ThreadValues>
    | {
        thread: Thread<ThreadValues>;
        status: "interrupted";
        interrupts?: undefined;
      };
  isLast: boolean;
}

export function GenericInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData, isLast }: GenericInboxItemProps<ThreadValues>) {
  const { updateQueryParams } = useQueryParams();

  const updatedAtDateString = format(
    new Date(threadData.thread.updated_at),
    "MM/dd h:mm a"
  );

  return (
    <div
      onClick={() =>
        updateQueryParams(
          VIEW_STATE_THREAD_QUERY_PARAM,
          threadData.thread.thread_id
        )
      }
      className={cn(
        "grid grid-cols-12 w-full p-4 py-4.5 cursor-pointer hover:bg-gray-50/90 transition-colors ease-in-out",
        !isLast && "border-b-[1px] border-gray-200"
      )}
    >
      <div className="col-span-1 flex justify-center pt-6">
        {/* Empty space for alignment with interrupted items */}
      </div>

      <div className="col-span-8 overflow-hidden">
        <div className="flex items-center pt-2.5">
          <p className="text-sm font-semibold text-black">Thread ID:</p>
          <ThreadIdCopyable showUUID threadId={threadData.thread.thread_id} />
        </div>
        <div className="text-sm text-muted-foreground h-[14px]"></div>
      </div>

      <div className="col-span-1 pt-3">
        <InboxItemStatuses status={threadData.status} />
      </div>

      <p className="col-span-2 text-right text-sm text-gray-600 font-light">
        {updatedAtDateString}
      </p>
    </div>
  );
}
