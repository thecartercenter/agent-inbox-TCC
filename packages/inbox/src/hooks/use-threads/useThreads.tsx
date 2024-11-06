import { ThreadValues } from "@/components/inbox/types";
import { createClient } from "@/lib/client";
import { Thread } from "@langchain/langgraph-sdk";
import { useCallback, useState } from "react";

export function useThreads() {
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<Thread<ThreadValues>[]>([]);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    const client = createClient();

    const interruptedThreads = await client.threads.search({
      limit: 100,
      status: "interrupted",
    });

    setThreads(interruptedThreads as unknown as Thread<ThreadValues>[]);
    setLoading(false);
  }, []);

  return {
    loading,
    threads,
    fetchThreads,
  };
}
