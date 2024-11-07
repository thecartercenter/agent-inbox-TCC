"use client";

import { DataTable } from "@/components/inbox/data-table";
import { TighterText } from "@/components/ui/header";
import { ThreadsProvider } from "@/contexts/ThreadContext";

export default function DemoPage() {
  return (
    <ThreadsProvider>
      <div className="container mx-auto py-10 max-h-screen overflow-hidden">
        <div className="my-5 p-1">
          <TighterText className="text-3xl font-medium">
            Agent Inbox
          </TighterText>
        </div>
        <DataTable />
      </div>
    </ThreadsProvider>
  );
}
