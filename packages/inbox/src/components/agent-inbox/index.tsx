import React from "react";
import { Inbox } from "./inbox";
import { Sidebar } from "./components/sidebar";
import { ChevronRight } from "lucide-react";

export function AgentInbox<
  ThreadValues extends Record<string, any> = Record<string, any>,
>(): React.ReactElement {
  return (
    <div className="bg-[#F9FAFB] flex h-screen">
      <div className="min-h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col items-start justify-start w-full gap-6 p-11">
        <div className="flex items-center justify-start w-full gap-2 px-12 tracking-wide">
          <p className="text-gray-600 text-sm">Home</p>
          <ChevronRight className="text-gray-600 h-[18px] w-[18px]" />
          <p className="text-gray-800 text-sm font-medium">Email Assistant</p>
        </div>
        <div className="h-full max-h-[95%] w-full">
          <Inbox<ThreadValues> />
        </div>
      </div>
    </div>
  );
}
