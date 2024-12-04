"use client";

import { AgentInbox } from "@/components/agent-inbox";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <div className="min-h-full overflow-hidden">
      <AgentInbox />
    </div>
  );
}
