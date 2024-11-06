"use client";

import { DataTable } from "@/components/inbox/data-table";
import { Email } from "@/components/inbox/types";
import { TighterText } from "@/components/ui/header";
import { useThreads } from "@/hooks/use-threads/useThreads";
import { getDummyEmails } from "@/lib/dummy";
import { useEffect } from "react";

async function getData(): Promise<Email[]> {
  // Fetch data from your API here.
  return getDummyEmails();
}

export default function DemoPage() {
  const { threads, loading, fetchThreads } = useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (threads.length || loading) return;
    fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="container mx-auto py-10 max-h-screen overflow-hidden">
      <div className="my-5 p-1">
        <TighterText className="text-3xl font-medium">Agent Inbox</TighterText>
      </div>
      <DataTable
        threads={threads}
        loading={loading}
        fetchThreads={fetchThreads}
      />
    </div>
  );
}
