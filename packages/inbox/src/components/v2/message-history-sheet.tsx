import React from "react";
import { Button } from "../ui/button";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { prettifyText } from "./utils";
import { X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

interface MessageHistoryProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Array<BaseMessage & { type: string }>;
}

function RenderMessage({
  message,
}: {
  message: BaseMessage & { type: string };
}) {
  switch (message.type) {
    case "human":
      return (
        <div className="flex gap-1 items-start w-full">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] leading-3"
            style={{
              backgroundColor: "#FDBA74",
              borderWidth: "1px",
              borderColor: "#F97316",
            }}
          >
            H
          </div>
          <p className="text-gray-800 text-pretty">
            {message.content as string}
          </p>
        </div>
      );
    case "ai":
      return (
        <div className="flex gap-2 items-start w-full">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] leading-3"
            style={{
              backgroundColor: "#FCA5A5",
              borderWidth: "1px",
              borderColor: "#EF4444",
            }}
          >
            A
          </div>
          <div className="flex flex-col items-start justify-start gap-2">
            {message.content && (
              <p className="text-gray-800 text-pretty">
                {message.content as string}
              </p>
            )}
            {(message as AIMessage).tool_calls?.length ? (
              <div className="flex flex-col gap-2 items-start justify-start">
                <p>Tool Calls</p>
                {(message as AIMessage).tool_calls &&
                  (message as AIMessage).tool_calls?.map((tc) => (
                    <div
                      className="flex flex-col gap-1 items-start text-sm border-[1px] rounded-xl p-3"
                      key={tc.id}
                    >
                      <pre className="text-gray-800 text-pretty">
                        Name: {tc.name}
                      </pre>
                      {Object.entries(tc.args).map(([k, v]) => (
                        <pre className="text-gray-800 text-pretty">
                          - {prettifyText(k)}:{" "}
                          {typeof v === "string" ? v : JSON.stringify(v, null)}
                        </pre>
                      ))}
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      );
    case "tool":
      return (
        <div className="flex gap-1 items-start w-full">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] leading-3"
            style={{
              backgroundColor: "#93C5FD",
              borderWidth: "1px",
              borderColor: "#3B82F6",
            }}
          >
            T
          </div>
          <div className="flex flex-col items-start justify-start gap-2">
            <p className="text-gray-800 text-pretty">
              {message.name && <strong>{message.name}: </strong>}
              {message.content as string}
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function MessageHistory({ messages, setOpen }: MessageHistoryProps) {
  return (
    <div className="fixed top-0 right-0 w-1/2 h-screen overflow-y-auto border-l-[1px]">
      <Button
        onClick={() => setOpen(false)}
        variant="ghost"
        className="fixed top-4 right-4 text-gray-600"
      >
        <X className="w-5 h-5" />
      </Button>
      <div className="w-full flex flex-col gap-4 items-start justify-start p-10">
        {messages.map((msg, idx) => (
          <RenderMessage key={msg.id || `msg-${idx}`} message={msg} />
        ))}
      </div>
    </div>
  );
}
