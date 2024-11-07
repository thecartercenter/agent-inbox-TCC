import { Separator } from "@/components/ui/separator";
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
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex flex-row items-center justify-between w-full pb-4border-b-[1px] border-gray-300">
        <TighterText className="text-lg">Message History</TighterText>
        <motion.div
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {open && (
          <CollapsibleContent asChild forceMount className="">
            <motion.div
              className="flex flex-col gap-2"
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

                if (type === "tool") {
                  return (
                    <>
                      <div
                        className={cn(
                          "flex flex-col gap-1 items-center justify-start text-sm text-gray-600 pt-4 px-6",
                          !isLast && "pb-4"
                        )}
                        key={msg.id || `msg-${idx}`}
                      >
                        <MsgLabel isInline={false} />
                        <div className="flex flex-col items-start justify-start mr-auto">
                          {msg.name && (
                            <pre className="text-gray-800">
                              <span className="text-gray-500">Tool:</span>{" "}
                              {msg.name}
                            </pre>
                          )}
                          <p className="text-gray-800 text-left">
                            {typeof content === "string"
                              ? content
                              : JSON.stringify(content)}
                          </p>
                        </div>
                      </div>
                      {!isLast && (
                        <Separator className="mx-4 w-[calc(100%-32px)]" />
                      )}
                    </>
                  );
                }

                if (
                  content &&
                  (!("tool_calls" in msg) ||
                    !(msg.tool_calls as ToolCall[])?.length)
                ) {
                  return (
                    <>
                      <div
                        className={cn(
                          "flex gap-1 items-center justify-start text-sm text-gray-600 pt-4 px-6",
                          !isLast && "pb-4"
                        )}
                        key={msg.id || `msg-${idx}`}
                      >
                        <MsgLabel isInline={true} />
                        <p className="text-gray-800">
                          &apos;
                          {typeof content === "string"
                            ? content
                            : JSON.stringify(content)}
                          &apos;
                        </p>
                      </div>
                      {!isLast && (
                        <Separator className="mx-4 w-[calc(100%-32px)]" />
                      )}
                    </>
                  );
                }

                if ("tool_calls" in msg) {
                  const toolCalls = msg.tool_calls as ToolCall[];
                  return (
                    <>
                      <div
                        className={cn(
                          "flex flex-col gap-1 items-center justify-start text-sm text-gray-600 pt-4 px-6",
                          !isLast && "pb-4"
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
                      {!isLast && (
                        <Separator className="mx-4 w-[calc(100%-32px)]" />
                      )}
                    </>
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
