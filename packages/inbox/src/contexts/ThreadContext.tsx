import {
  HumanLoopEvent,
  ThreadInterruptData,
  ThreadValues,
} from "@/components/inbox/types";
import { createClient } from "@/lib/client";
import { Thread, ThreadState } from "@langchain/langgraph-sdk";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ThreadContentType = {
  loading: boolean;
  threadInterrupts: ThreadInterruptData[];
  updateState: (
    threadId: string,
    values: Record<string, any>,
    asNode?: string
  ) => Promise<void>;
  fetchThreads: () => Promise<void>;
};

const ThreadsContext = createContext<ThreadContentType | undefined>(undefined);

export function ThreadsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [threadInterrupts, setThreadInterrupts] = useState<
    ThreadInterruptData[]
  >([]);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    const client = createClient();

    const interruptedThreads = (await client.threads.search({
      limit: 100,
      status: "interrupted",
    })) as unknown as Awaited<Thread<ThreadValues>[]>;

    const threadStates = await bulkGetThreadStates(
      interruptedThreads.map((t) => t.thread_id)
    );

    const interruptValues = threadStates.map((tState) => {
      const lastTask =
        tState.thread_state.tasks[tState.thread_state.tasks.length - 1];
      const lastInterrupt = lastTask.interrupts[lastTask.interrupts.length - 1];
      const thread = interruptedThreads.find(
        (t) => t.thread_id === tState.thread_id
      );
      if (!thread) {
        throw new Error(`Thread not found: ${tState.thread_id}`);
      }

      return {
        thread_id: tState.thread_id,
        interrupt_value:
          "value" in lastInterrupt
            ? (lastInterrupt.value as HumanLoopEvent)
            : undefined,
        thread: thread,
        next: tState.thread_state.next,
      };
    });

    setThreadInterrupts(interruptValues);
    setLoading(false);
  }, []);

  const bulkGetThreadStates = useCallback(
    async (
      threadIds: string[]
    ): Promise<
      { thread_id: string; thread_state: ThreadState<ThreadValues> }[]
    > => {
      const client = createClient();
      const chunkSize = 25;
      const chunks = [];

      // Split threadIds into chunks of 25
      for (let i = 0; i < threadIds.length; i += chunkSize) {
        chunks.push(threadIds.slice(i, i + chunkSize));
      }

      // Process each chunk sequentially
      const results: {
        thread_id: string;
        thread_state: ThreadState<ThreadValues>;
      }[] = [];
      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(async (id) => ({
            thread_id: id,
            thread_state: await client.threads.getState<ThreadValues>(id),
          }))
        );
        results.push(...chunkResults);
      }

      return results;
    },
    []
  );

  const updateState = async (
    threadId: string,
    values: Record<string, any>,
    asNode?: string
  ) => {
    const client = createClient();
    await client.threads.updateState(threadId, {
      values,
      asNode,
    });
    await client.runs.create(threadId, "support");
    setThreadInterrupts((prev) => {
      return prev.filter((p) => p.thread_id !== threadId);
    });
    // Void so it is not blocking.
    void fetchThreads();
  };

  const contextValue: ThreadContentType = {
    loading,
    threadInterrupts,
    updateState,
    fetchThreads,
  };

  return (
    <ThreadsContext.Provider value={contextValue}>
      {children}
    </ThreadsContext.Provider>
  );
}

export function useThreadsContext() {
  const context = useContext(ThreadsContext);
  if (context === undefined) {
    throw new Error("useThreadsContext must be used within a ThreadsProvider");
  }
  return context;
}
