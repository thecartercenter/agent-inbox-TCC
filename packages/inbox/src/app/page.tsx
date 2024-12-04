"use client";

import { AgentInbox } from "@/components/agent-inbox";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-full overflow-hidden">
        <AgentInbox />
      </div>
    </React.Suspense>
  );
}
