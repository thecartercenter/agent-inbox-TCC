import { HumanResponse, ThreadInterruptData } from "@/components/v2/types";
import { HumanInterrupt } from "@/components/v2/types";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/client";
import { Run, Thread, ThreadState } from "@langchain/langgraph-sdk";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ThreadContentType<
  ThreadValues extends Record<string, any> = Record<string, any>,
> = {
  loading: boolean;
  threadInterrupts: ThreadInterruptData<ThreadValues>[];
  ignoreThread: (threadId: string) => Promise<void>;
  updateState: (
    threadId: string,
    values: Record<string, any>,
    asNode?: string
  ) => Promise<void>;
  fetchThreads: () => Promise<void>;
  sendHumanResponse: (
    threadId: string,
    response: HumanResponse[]
  ) => Promise<Run | undefined>;
};

const ThreadsContext = createContext<ThreadContentType | undefined>(undefined);

export function ThreadsProvider<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [threadInterrupts, setThreadInterrupts] = useState<
    ThreadInterruptData<ThreadValues>[]
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

    const interruptValues = threadStates.flatMap((tState) => {
      const lastTask =
        tState.thread_state.tasks[tState.thread_state.tasks.length - 1];
      const lastInterrupt = lastTask.interrupts[lastTask.interrupts.length - 1];
      const thread = interruptedThreads.find(
        (t) => t.thread_id === tState.thread_id
      );
      if (!thread) {
        throw new Error(`Thread not found: ${tState.thread_id}`);
      }

      if (!lastInterrupt || !("value" in lastInterrupt)) {
        return [];
      }

      return [
        {
          thread_id: tState.thread_id,
          interrupt_value: lastInterrupt.value as HumanInterrupt[],
          thread: thread,
          next: tState.thread_state.next,
        },
      ];
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

    try {
      await client.threads.updateState(threadId, {
        values,
        asNode,
      });
      await client.runs.create(threadId, "support");

      setThreadInterrupts((prev) => {
        return prev.filter((p) => p.thread_id !== threadId);
      });
      toast({
        title: "Success",
        description: "Updated thread",
        duration: 3000,
      });
    } catch (e) {
      console.error("Error updating thread state", e);
      toast({
        title: "Error",
        description: "Failed to update thread",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const ignoreThread = async (threadId: string) => {
    const client = createClient();
    try {
      await client.threads.updateState(threadId, {
        values: null,
      });

      setThreadInterrupts((prev) => {
        return prev.filter((p) => p.thread_id !== threadId);
      });
      toast({
        title: "Success",
        description: "Ignored thread",
        duration: 3000,
      });
    } catch (e) {
      console.error("Error ignoring thread", e);
      toast({
        title: "Error",
        description: "Failed to ignore thread",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const sendHumanResponse = async (
    threadId: string,
    response: HumanResponse[]
  ) => {
    const client = createClient();
    try {
      console.log("Sending in this value", {
        resume: response,
      });
      return client.runs.create(threadId, "support", {
        command: {
          resume: response,
        },
      });
    } catch (e) {
      console.error("Error sending human response", e);
      return undefined;
    }
  };

  const contextValue: ThreadContentType = {
    loading,
    threadInterrupts,
    ignoreThread,
    updateState,
    fetchThreads,
    sendHumanResponse,
  };

  return (
    <ThreadsContext.Provider value={contextValue}>
      {children}
    </ThreadsContext.Provider>
  );
}

export function useThreadsContext<
  T extends Record<string, any> = Record<string, any>,
>() {
  const context = useContext(ThreadsContext) as ThreadContentType<T>;
  if (context === undefined) {
    throw new Error("useThreadsContext must be used within a ThreadsProvider");
  }
  return context;
}
