import { cn } from "@/lib/utils";
import { Thread } from "@langchain/langgraph-sdk";
import { ThreadIdCopyable } from "./thread-id";
import { InboxItemStatuses } from "./statuses";
import { format } from "date-fns";
import { useQueryParams } from "../hooks/use-query-params";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";

import { GenericThreadData } from "../types";
import { useToast } from "@/hooks/use-toast";
import { constructOpenInStudioURL } from "../utils";
import { Button } from "@/components/ui/button";
import { useThreadsContext } from "../contexts/ThreadContext";
import { useQueryParams } from "../hooks/use-query-params";
import {
  STUDIO_NOT_WORKING_TROUBLESHOOTING_URL,
  VIEW_STATE_THREAD_QUERY_PARAM,
} from "../constants";

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

  const selectedInbox = agentInboxes.find((i) => i.selected);

  const handleOpenInStudio = () => {
    if (!selectedInbox) {
      toast({
        title: "Error",
        description: "No agent inbox selected.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(
      selectedInbox,
      threadData.thread.thread_id
    );

    if (studioUrl === "#") {
      toast({
        title: "Error",
        description: (
          <>
            <p>
              Could not construct Studio URL. Check if inbox has necessary
              details (Project ID, Tenant ID).
            </p>
            <p>
              If the issue persists, see the{" "}
              <a
                href={STUDIO_NOT_WORKING_TROUBLESHOOTING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                troubleshooting section
              </a>
            </p>
          </>
        ),
        variant: "destructive",
        duration: 10000,
      });
    } else {
      window.open(studioUrl, "_blank");
    }
  };


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
        "grid grid-cols-12 w-full p-4 py-4.5 cursor-pointer hover:bg-gray-50/90 transition-colors ease-in-out h-[71px]",
        !isLast && "border-b-[1px] border-gray-200"
      )}
    >
        <div className="flex items-center gap-2">
          <div className="col-span-1 flex justify-center pt-6">
        {/* Empty space for alignment with interrupted items */}
      </div>
      <div
        className={cn(
          "flex items-center justify-start gap-2",
          selectedInbox ? "col-span-7" : "col-span-9"
        )}
      >
       <p className="text-sm font-semibold text-black">Thread ID:</p>
        <ThreadIdCopyable showUUID threadId={threadData.thread.thread_id} />
      </div>

      {selectedInbox && (
        <div className="col-span-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 bg-white"
            onClick={handleOpenInStudio}
          >
            Studio
          </Button>
        </div>
      </div>


      <div className={cn("col-span-2", !selectedInbox && "col-start-10")}>
        <InboxItemStatuses status={threadData.status} />
      </div>

      <p
        className={cn(
          "col-span-1 text-gray-600 font-light text-sm",
          !selectedInbox && "col-start-12"
        )}
      >
        {updatedAtDateString}
      </p>
    </div>
  );
}
