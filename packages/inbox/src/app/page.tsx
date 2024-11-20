"use client";

import { Inbox } from "@/components/v2";
import { ThreadValues } from "@/components/v2/types";
import { ThreadsProvider } from "@/contexts/ThreadContext";
import React from "react";

export default function DemoPage() {
  return (
    <ThreadsProvider<ThreadValues>>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Inbox<ThreadValues> />
      </React.Suspense>
    </ThreadsProvider>
  );
}
