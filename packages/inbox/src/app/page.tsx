"use client";

import { TighterText } from "@/components/ui/header";
import { Inbox } from "@/components/v2";
import { ThreadsProvider } from "@/contexts/ThreadContext";
import React from "react";

export default function DemoPage() {
  return (
    <ThreadsProvider>
      <div className="w-full max-h-screen py-10 px-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="my-5 p-1">
          <TighterText className="text-3xl font-medium">Inbox</TighterText>
        </div>
        {/* TODO: Hookup different inbox types */}
        {/* <div className="flex gap-2 items-center justify-start">
          <PillButton
            onClick={() => setSelectedInbox("all")}
            variant={selectedInbox === "all" ? "default" : "outline"}
          >
            All
          </PillButton>
          <PillButton
            onClick={() => setSelectedInbox("unread")}
            variant={selectedInbox === "unread" ? "default" : "outline"}
          >
            Unread
          </PillButton>
        </div> */}
        <div className="my-5">
          <Inbox />
        </div>
      </div>
    </ThreadsProvider>
  );
}
