import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ThreadValues } from "../types";
import { useState } from "react";
import { TighterText } from "@/components/ui/header";
import { ChevronDown } from "lucide-react";
import { BaseMessage } from "@langchain/core/messages";
import { Button } from "@/components/ui/button";
import { startCase } from "lodash";
import { ToolCall } from "@langchain/core/messages/tool";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ThreadHistoryProps {
  threadValues: ThreadValues;
}

const mapTypeToLabel = (type: string) => {
  switch (type) {
    case "ai":
      return "Assistant";
    case "human":
    case "user":
      return "User";
    case "tool":
    case "function":
      return "Tool";
    default:
      return startCase(type);
  }
};

export function ThreadHistory({ threadValues }: ThreadHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between mb-4"
        >
          <TighterText className="text-lg">Message History</TighterText>
          <motion.div
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {open && (
          <CollapsibleContent asChild forceMount>
            <motion.div
              className="flex flex-col gap-2 px-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {(
                threadValues.messages as Array<BaseMessage & { type: string }>
              ).map((msg, idx) => {
                const { type, content } = msg;
                const isLast = idx === threadValues.messages.length - 1;

                const msgIndex = (
                  <span className="text-gray-500 text-xs font-light">
                    ({idx + 1})
                  </span>
                );
                const MsgLabel = ({
                  isInline = false,
                }: {
                  isInline: boolean;
                }) => (
                  <TighterText
                    className={cn(
                      "text-base text-gray-800 flex items-center justify-center gap-1",
                      !isInline && "mr-auto"
                    )}
                  >
                    {msgIndex}
                    {mapTypeToLabel(type)}
                  </TighterText>
                );

                if (
                  content &&
                  (!("tool_calls" in msg) ||
                    !(msg.tool_calls as ToolCall[])?.length)
                ) {
                  return (
                    <div
                      className={cn(
                        "flex gap-1 items-center justify-start text-sm text-gray-600",
                        !isLast && "pb-4 border-b-[1px] border-gray-200"
                      )}
                      key={msg.id || `msg-${idx}`}
                    >
                      <MsgLabel isInline={true} />
                      <p>
                        &apos;
                        {typeof content === "string"
                          ? content
                          : JSON.stringify(content)}
                        &apos;
                      </p>
                    </div>
                  );
                }

                if ("tool_calls" in msg) {
                  const toolCalls = msg.tool_calls as ToolCall[];
                  return (
                    <div
                      className={cn(
                        "flex flex-col gap-1 items-center justify-start text-sm text-gray-600",
                        !isLast && "pb-4 border-b-[1px] border-gray-200"
                      )}
                      key={msg.id || `msg-${idx}`}
                    >
                      <MsgLabel isInline={false} />
                      <div className="flex flex-col items-center justify-start mr-auto">
                        {toolCalls.map((tc, idx) => (
                          <div key={tc.id || `tc-${idx}`}>
                            <pre className="text-gray-800">
                              <span className="text-gray-500">Tool:</span>{" "}
                              {tc.name}
                            </pre>
                            {Object.entries(tc.args).map(
                              ([key, value], idx) => {
                                const valueString =
                                  typeof value === "string" && value
                                    ? value
                                    : typeof value === "string" && !value
                                      ? "null"
                                      : JSON.stringify(value);

                                return (
                                  <pre
                                    className="text-pretty max-w-2xl text-gray-800"
                                    key={`arg-${key}-${idx}`}
                                  >
                                    <span className="text-gray-500">
                                      {key}:
                                    </span>{" "}
                                    {valueString}
                                  </pre>
                                );
                              }
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return <div key={msg.id || `msg-${idx}`}>{msg.type}</div>;
              })}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
