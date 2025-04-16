import React from "react";
import { useQueryParams } from "./hooks/use-query-params";
import { INBOX_PARAM, VIEW_STATE_THREAD_QUERY_PARAM } from "./constants";
import { ThreadStatusWithAll } from "./types";
import { AgentInboxView } from "./inbox-view";
import { ThreadView } from "./thread-view";
import { useScrollPosition } from "./hooks/use-scroll-position";

export function AgentInbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>() {
  const { searchParams, updateQueryParams, getSearchParam } = useQueryParams();
  const [selectedInbox, setSelectedInbox] =
    React.useState<ThreadStatusWithAll>("interrupted");
  const { scrollPosition, saveScrollPosition, restoreScrollPosition } = useScrollPosition();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedThreadIdParam = searchParams.get(VIEW_STATE_THREAD_QUERY_PARAM);
  const isStateViewOpen = !!selectedThreadIdParam;
  const prevIsStateViewOpen = React.useRef<boolean>(false);
  
  // Need to track first render to avoid restoring scroll on initial page load
  const isFirstRender = React.useRef(true);

  // Track URL changes to detect when the thread ID changes (not just appears/disappears)
  const lastThreadId = React.useRef<string | null>(null);

  // Effect to handle transitions between list and thread views
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Skip during first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevIsStateViewOpen.current = isStateViewOpen;
      lastThreadId.current = selectedThreadIdParam;
      return;
    }
    
    // Case 1: Going from list view to thread view
    if (!prevIsStateViewOpen.current && isStateViewOpen) {
      console.log("Transitioning from list to thread view, saving scroll position...");
      
      // Try to save scroll position
      if (window.scrollY > 0) {
        saveScrollPosition(); // Save window scroll
      } else if (containerRef.current && containerRef.current.scrollTop > 0) {
        saveScrollPosition(containerRef.current);
      }
    }
    // Case 2: Going from thread view to list view
    else if (prevIsStateViewOpen.current && !isStateViewOpen) {
      console.log("Transitioning back to list view, restoring scroll position...");
      
      // Try multiple times to restore scroll with increasing delays
      const maxAttempts = 5;
      
      for (let i = 0; i < maxAttempts; i++) {
        setTimeout(() => {
          if (containerRef.current) {
            console.log(`Restore attempt ${i+1}/${maxAttempts}`);
            restoreScrollPosition(containerRef.current);
          }
        }, 50 * (i + 1));
      }
    }
    // Case 3: Switching between different thread views
    else if (prevIsStateViewOpen.current && isStateViewOpen && 
             lastThreadId.current !== selectedThreadIdParam) {
      console.log("Switching between different threads, no scroll action needed");
    }
    
    // Update previous state for next render
    prevIsStateViewOpen.current = isStateViewOpen;
    lastThreadId.current = selectedThreadIdParam;
  }, [isStateViewOpen, selectedThreadIdParam, saveScrollPosition, restoreScrollPosition]);

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const currentInbox = getSearchParam(INBOX_PARAM) as
        | ThreadStatusWithAll
        | undefined;
      if (!currentInbox) {
        // Set default inbox if none selected
        updateQueryParams(INBOX_PARAM, selectedInbox);
      } else {
        setSelectedInbox(currentInbox);
      }
    } catch (e) {
      console.error("Error updating query params & setting inbox", e);
    }
  }, [searchParams]);

  if (isStateViewOpen) {
    return <ThreadView threadId={selectedThreadIdParam} />;
  }

  return (
    <AgentInboxView<ThreadValues> 
      saveScrollPosition={saveScrollPosition}
      containerRef={containerRef} 
    />
  );
}
