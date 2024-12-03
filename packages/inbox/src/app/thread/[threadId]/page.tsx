"use client";

import { ThreadViewPage } from "@/components/agent-inbox/thread-view-page";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const params = useParams();
  const threadId = params.threadId as string;

  return (
    <div className="min-w-full min-h-full">
      <React.Suspense fallback={<div>Loading...</div>}>
        <ThreadViewPage threadId={threadId} />
      </React.Suspense>
    </div>
  );
}
