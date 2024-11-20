import {
  HumanResponse,
  ThreadData,
  ThreadStatusWithAll,
} from "@/components/agent-inbox/types";
import { HumanInterrupt } from "@/components/agent-inbox/types";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/client";
import { Run, Thread, ThreadState } from "@langchain/langgraph-sdk";
import React, { useEffect } from "react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useQueryParams } from "../hooks/use-query-params";
import { LIMIT_PARAM, OFFSET_PARAM } from "../constants";

type ThreadContentType<
  ThreadValues extends Record<string, any> = Record<string, any>,
> = {
  loading: boolean;
  threadData: ThreadData<ThreadValues>[];
  hasMoreThreads: boolean;
  ignoreThread: (threadId: string) => Promise<void>;
  fetchThreads: (inbox: ThreadStatusWithAll) => Promise<void>;
  sendHumanResponse: <TStream extends boolean = false>(
    threadId: string,
    response: HumanResponse[],
    options?: {
      stream?: TStream;
    }
  ) => TStream extends true
    ? AsyncGenerator<{
        event: Record<string, any>;
        data: any;
      }>
    : Promise<Run>;
};

const ThreadsContext = createContext<ThreadContentType | undefined>(undefined);

export function ThreadsProvider<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ children }: { children: ReactNode }) {
  const { getSearchParam, searchParams } = useQueryParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [threadData, setThreadData] = useState<ThreadData<ThreadValues>[]>([]);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const inboxSearchParam = getSearchParam("inbox") as ThreadStatusWithAll;
    if (!inboxSearchParam) {
      return;
    }
    fetchThreads(inboxSearchParam);
  }, [searchParams]);

  const fetchThreads = useCallback(async (inbox: ThreadStatusWithAll) => {
    setLoading(true);
    const client = createClient();

    try {
      const limitQueryParam = getSearchParam(LIMIT_PARAM);
      if (!limitQueryParam) {
        throw new Error("Limit query param not found");
      }
      const offsetQueryParam = getSearchParam(OFFSET_PARAM);
      if (!offsetQueryParam) {
        throw new Error("Offset query param not found");
      }
      const limit = Number(limitQueryParam);
      const offset = Number(offsetQueryParam);

      if (limit > 100) {
        toast({
          title: "Error",
          description: "Cannot fetch more than 100 threads at a time",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      const statusInput = inbox === "all" ? {} : { status: inbox };

      const threadSearchArgs = {
        offset,
        limit,
        ...statusInput,
      };
      const threads = await client.threads.search(threadSearchArgs);

      const data: ThreadData<ThreadValues>[] = [];
      if (["interrupted", "all"].includes(inbox)) {
        const interruptedThreads = threads.filter(
          (t) => t.status === "interrupted"
        );
        if (interruptedThreads.length > 0) {
          const interruptedStates = await bulkGetThreadStates(
            interruptedThreads.map((t) => t.thread_id)
          );

          const interruptedData: ThreadData<ThreadValues>[] =
            interruptedStates.flatMap((state) => {
              const lastTask =
                state.thread_state.tasks[state.thread_state.tasks.length - 1];
              const lastInterrupt =
                lastTask.interrupts[lastTask.interrupts.length - 1];
              const thread = interruptedThreads.find(
                (t) => t.thread_id === state.thread_id
              );
              if (!thread) {
                throw new Error(`Thread not found: ${state.thread_id}`);
              }

              if (!lastInterrupt || !("value" in lastInterrupt)) {
                return [];
              }

              return {
                status: "interrupted",
                thread: thread as Thread<ThreadValues>,
                interrupts: lastInterrupt.value as HumanInterrupt[],
              };
            });
          data.push(...interruptedData);
        }
      }

      threads.forEach((t) => {
        if (t.status === "interrupted") {
          return;
        }
        data.push({
          status: t.status,
          thread: t as Thread<ThreadValues>,
        });
      });

      // Sort data by created_at in descending order (most recent first)
      const sortedData = data.sort((a, b) => {
        return (
          new Date(b.thread.created_at).getTime() -
          new Date(a.thread.created_at).getTime()
        );
      });

      setThreadData(sortedData);
      setHasMoreThreads(threads.length === limit);
    } catch (e) {
      console.error("Failed to fetch threads", e);
    }
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

  const ignoreThread = async (threadId: string) => {
    const client = createClient();
    try {
      await client.threads.updateState(threadId, {
        values: null,
      });

      setThreadData((prev) => {
        return prev.filter((p) => p.thread.thread_id !== threadId);
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

  const sendHumanResponse = <TStream extends boolean = false>(
    threadId: string,
    response: HumanResponse[],
    options?: {
      stream?: TStream;
    }
  ): TStream extends true
    ? AsyncGenerator<{
        event: Record<string, any>;
        data: any;
      }>
    : Promise<Run> => {
    const client = createClient();
    try {
      if (options?.stream) {
        return client.runs.stream(threadId, "support", {
          command: {
            resume: response,
          },
          streamMode: "events",
        }) as any; // Type assertion needed due to conditional return type
      }
      return client.runs.create(threadId, "support", {
        command: {
          resume: response,
        },
      }) as any; // Type assertion needed due to conditional return type
    } catch (e) {
      console.error("Error sending human response", e);
      throw e;
    }
  };

  const contextValue: ThreadContentType = {
    loading,
    threadData,
    hasMoreThreads,
    ignoreThread,
    sendHumanResponse,
    fetchThreads,
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
