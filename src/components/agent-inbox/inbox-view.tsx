import { useThreadsContext } from "@/components/agent-inbox/contexts/ThreadContext";
import { InboxItem } from "./components/inbox-item";
import React from "react";
import { useQueryParams } from "./hooks/use-query-params";
import { INBOX_PARAM, LIMIT_PARAM, OFFSET_PARAM } from "./constants";
import { ThreadStatusWithAll } from "./types";
import { Pagination } from "./components/pagination";
import { Inbox as InboxIcon, LoaderCircle } from "lucide-react";
import { InboxButtons } from "./components/inbox-buttons";

interface AgentInboxViewProps<
  _ThreadValues extends Record<string, any> = Record<string, any>,
> {
  saveScrollPosition: (element?: HTMLElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function AgentInboxView<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ saveScrollPosition, containerRef }: AgentInboxViewProps<ThreadValues>) {
  const { searchParams, updateQueryParams, getSearchParam } = useQueryParams();
  const { loading, threadData } = useThreadsContext<ThreadValues>();
  const selectedInbox = (getSearchParam(INBOX_PARAM) ||
    "interrupted") as ThreadStatusWithAll;
  const scrollableContentRef = React.useRef<HTMLDivElement>(null);

  // Register scroll event listener to automatically save scroll position whenever user scrolls
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Define the scroll handler that will save the current scroll position
    const handleScroll = () => {
      // Find the element that's actually scrolling
      if (
        scrollableContentRef.current &&
        scrollableContentRef.current.scrollTop > 0
      ) {
        // First check the inner container (thread list)
        saveScrollPosition(scrollableContentRef.current);
      } else if (containerRef.current && containerRef.current.scrollTop > 0) {
        // Then check the outer container
        saveScrollPosition(containerRef.current);
      } else if (window.scrollY > 0) {
        // Finally check the window
        saveScrollPosition();
      }
    };

    // We need to throttle the handler to avoid performance issues
    let timeout: NodeJS.Timeout | null = null;
    const throttledScrollHandler = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          handleScroll();
          timeout = null;
        }, 300); // Only call every 300ms
      }
    };

    // Add the event listener
    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });

    // Don't forget to clean up
    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
      if (timeout) clearTimeout(timeout);
    };
  }, [containerRef, saveScrollPosition]);

  const changeInbox = async (inbox: ThreadStatusWithAll) => {
    updateQueryParams(
      [INBOX_PARAM, OFFSET_PARAM, LIMIT_PARAM],
      [inbox, "0", "10"]
    );
  };

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const offsetQueryParam = getSearchParam(OFFSET_PARAM);
      const limitQueryParam = getSearchParam(LIMIT_PARAM);
      if (!offsetQueryParam) {
        updateQueryParams(OFFSET_PARAM, "0");
      }
      if (!limitQueryParam) {
        updateQueryParams(LIMIT_PARAM, "10");
      }
    } catch (e) {
      console.error("Error updating query params", e);
    }
  }, [searchParams]);

  const threadDataToRender = React.useMemo(
    () =>
      threadData.filter((t) => {
        if (selectedInbox === "all") return true;
        return t.status === selectedInbox;
      }),
    [selectedInbox, threadData]
  );
  const noThreadsFound = !threadDataToRender.length;

  // Save the parent component reference to the main container
  React.useEffect(() => {
    if (containerRef.current) {
      console.log("Container ref set to main container element");
    }
  }, [containerRef.current]);

  // Correct way to save scroll position before navigation
  const handleThreadClick = () => {
    // First try the inner scrollable div
    if (
      scrollableContentRef.current &&
      scrollableContentRef.current.scrollTop > 0
    ) {
      console.log(
        `Saving inner scroll position: ${scrollableContentRef.current.scrollTop}px`
      );
      saveScrollPosition(scrollableContentRef.current);
    }
    // Then try the outer container
    else if (containerRef.current && containerRef.current.scrollTop > 0) {
      console.log(
        `Saving main container scroll position: ${containerRef.current.scrollTop}px`
      );
      saveScrollPosition(containerRef.current);
    }
    // Finally try window
    else if (window.scrollY > 0) {
      console.log(`Saving window scroll position: ${window.scrollY}px`);
      saveScrollPosition();
    }
    // If none have scroll, check why
    else {
      console.log(
        "Warning: No scroll position detected! Element structure may have changed."
      );

      // Find all scrollable elements and log their scroll positions (for debugging)
      const scrollableElements = document.querySelectorAll(
        '[class*="overflow"]'
      );
      scrollableElements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollTop > 0) {
          console.log(`Found scrollable element ${i}: ${htmlEl.scrollTop}px`);
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="min-w-[1000px] h-full overflow-y-auto">
      <div className="pl-5 pt-4">
        <InboxButtons changeInbox={changeInbox} />
      </div>
      <div
        ref={scrollableContentRef}
        className="flex flex-col items-start w-full max-h-fit h-full border-y-[1px] border-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-3"
      >
        {threadDataToRender.map((threadData, idx) => {
          return (
            <InboxItem<ThreadValues>
              key={`inbox-item-${threadData.thread.thread_id}`}
              threadData={threadData}
              isLast={idx === threadDataToRender.length - 1}
              onThreadClick={handleThreadClick}
            />
          );
        })}
        {noThreadsFound && !loading && (
          <div className="w-full flex items-center justify-center p-4">
            <div className="flex gap-2 items-center justify-center text-gray-700">
              <InboxIcon className="w-6 h-6" />
              <p className="font-medium">No threads found</p>
            </div>
          </div>
        )}
        {noThreadsFound && loading && (
          <div className="w-full flex items-center justify-center p-4">
            <div className="flex gap-2 items-center justify-center text-gray-700">
              <p className="font-medium">Loading</p>
              <LoaderCircle className="w-6 h-6 animate-spin" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-start w-full p-5">
        <Pagination />
      </div>
    </div>
  );
}
