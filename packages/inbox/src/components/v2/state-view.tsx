import { ChevronRight, X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { prettifyText } from "./utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BaseMessage, isBaseMessage } from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { useThreadsContext } from "@/contexts/ThreadContext";
import { TighterText } from "../ui/header";

interface StateViewRecursiveProps {
  value: unknown;
  expanded?: boolean;
}

const messageTypeToLabel = (message: BaseMessage) => {
  let type = "";
  if ("type" in message) {
    type = message.type as string;
  } else {
    type = message._getType();
  }

  switch (type) {
    case "human":
      return "User";
    case "ai":
      return "Assistant";
    case "tool":
      return "Tool";
    case "System":
      return "System";
    default:
      return "";
  }
};

const optionallyExtractToolCalls = (
  message: BaseMessage
): string | undefined => {
  if (!("tool_calls" in message) || !message.tool_calls) {
    return undefined;
  }
  const toolCallText = (message.tool_calls as ToolCall[])
    .map((tc) => {
      return `${tc.name}(\n${JSON.stringify(tc.args, null)}\n)`;
    })
    .join("\n");
  return toolCallText;
};

function MessagesRenderer({ messages }: { messages: BaseMessage[] }) {
  return (
    <div className="flex flex-col gap-1">
      {messages.map((msg, idx) => {
        const messageTypeLabel = messageTypeToLabel(msg);
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content, null);
        const toolCallText = optionallyExtractToolCalls(msg);
        return (
          <div
            key={msg.id || `message-${idx}`}
            className="flex flex-col gap-[2px] ml-2"
          >
            <p className="font-medium text-gray-700">{messageTypeLabel}:</p>
            {content && <p className="text-gray-600">{content}</p>}
            {toolCallText && (
              <p className="font-mono text-gray-600">{toolCallText}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const objectToString = (item: unknown) => {
  if (isBaseMessage(item)) {
    const contentText =
      typeof item.content === "string"
        ? item.content
        : JSON.stringify(item.content, null);
    let toolCallText = "";
    if ("tool_calls" in item) {
      toolCallText = JSON.stringify(item.tool_calls, null);
    }
    if ("type" in item) {
      return `${item.type}:${contentText ? ` ${contentText}` : ""}${toolCallText ? ` - Tool calls: ${toolCallText}` : ""}`;
    } else if ("_getType" in item) {
      return `${item._getType()}:${contentText ? ` ${contentText}` : ""}${toolCallText ? ` - Tool calls: ${toolCallText}` : ""}`;
    }
  } else if (
    typeof item === "object" &&
    item &&
    "type" in item &&
    "content" in item
  ) {
    const contentText =
      typeof item.content === "string"
        ? item.content
        : JSON.stringify(item.content, null);
    let toolCallText = "";
    if ("tool_calls" in item) {
      toolCallText = JSON.stringify(item.tool_calls, null);
    }
    return `${item.type}:${contentText ? ` ${contentText}` : ""}${toolCallText ? ` - Tool calls: ${toolCallText}` : ""}`;
  }

  if (typeof item === "object") {
    return JSON.stringify(item, null);
  } else {
    return item as string;
  }
};

const isArrayOfMessages = (
  value: Record<string, any>[]
): value is BaseMessage[] => {
  if (
    value.every(isBaseMessage) ||
    value.every(
      (v) =>
        "id" in v && "type" in v && "content" in v && "additional_kwargs" in v
    )
  ) {
    return true;
  }
  return false;
};

function StateViewRecursive(props: StateViewRecursiveProps) {
  try {
    if (
      Object.prototype.toString.call(props.value) === "[object Date]" ||
      new Date(props.value as string)
    ) {
      const date = new Date(props.value as string);
      return (
        <p className="font-light text-gray-600">
          {format(date, "MM/dd/yyyy hh:mm a")}
        </p>
      );
    }
  } catch (_) {
    // failed to parse date. no-op
  }

  if (["string", "number"].includes(typeof props.value)) {
    return (
      <p className="font-light text-gray-600 whitespace-pre-wrap">
        {props.value as string | number}
      </p>
    );
  }

  if (typeof props.value === "boolean") {
    return (
      <p className="font-light text-gray-600 whitespace-pre-wrap">
        {JSON.stringify(props.value)}
      </p>
    );
  }

  if (props.value == null) {
    return <p className="font-light text-gray-600 whitespace-pre-wrap">null</p>;
  }

  if (Array.isArray(props.value)) {
    if (props.value.length > 0 && isArrayOfMessages(props.value)) {
      return <MessagesRenderer messages={props.value} />;
    }

    const valueArray = props.value as unknown[];
    return (
      <div className="flex flex-row gap-1 items-start justify-start">
        <span className="font-normal text-black">[</span>
        {valueArray.map((item, idx) => {
          const itemRenderValue = objectToString(item);
          return (
            <div
              key={`state-view-${idx}`}
              className="flex flex-row items-start whitespace-pre-wrap"
            >
              <StateViewRecursive value={itemRenderValue} />
              {idx < valueArray?.length - 1 && (
                <span className="text-black font-normal">,&nbsp;</span>
              )}
            </div>
          );
        })}
        <span className="font-normal text-black">]</span>
      </div>
    );
  }

  if (typeof props.value === "object") {
    if (Object.keys(props.value).length === 0) {
      return <p className="font-light text-gray-600">{"{}"}</p>;
    }
    return (
      <div className="flex flex-col gap-1 items-start justify-start ml-6 relative">
        {/* Vertical line */}
        <div className="absolute left-[-24px] top-0 h-full w-[1px] bg-gray-200" />

        {Object.entries(props.value).map(([key, value], idx) => (
          <div
            key={`state-view-object-${key}-${idx}`}
            className="relative w-full"
          >
            {/* Horizontal connector line */}
            <div className="absolute left-[-20px] top-[10px] h-[1px] w-[18px] bg-gray-200" />
            <StateViewObject
              expanded={props.expanded}
              keyName={key}
              value={value}
            />
          </div>
        ))}
      </div>
    );
  }
}

function HasContentsEllipsis({ onClick }: { onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "font-mono text-[10px] leading-3 p-[2px] rounded-md",
        "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800",
        "transition-colors ease-in-out cursor-pointer",
        "-translate-y-[2px] inline-block"
      )}
    >
      {"{...}"}
    </span>
  );
}

interface StateViewProps {
  keyName: string;
  value: unknown;
  /**
   * Whether or not to expand or collapse the view
   * @default true
   */
  expanded?: boolean;
}

export function StateViewObject(props: StateViewProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (props.expanded != null) {
      setExpanded(props.expanded);
    }
  }, [props.expanded]);

  return (
    <div className="flex flex-row gap-2 items-start justify-start relative text-sm">
      <motion.div
        initial={false}
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          onClick={() => setExpanded((prev) => !prev)}
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-black rounded-md transition-colors ease-in-out cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
      <div className="flex flex-col gap-1 items-start justify-start">
        <p className="text-black font-normal">
          {prettifyText(props.keyName)}{" "}
          {!expanded && (
            <HasContentsEllipsis onClick={() => setExpanded((prev) => !prev)} />
          )}
        </p>
        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          style={{ overflow: "hidden" }}
          className="relative"
        >
          <StateViewRecursive expanded={props.expanded} value={props.value} />
        </motion.div>
      </div>
    </div>
  );
}

export function StateView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(true);
  const { threadInterrupts } = useThreadsContext();

  const threadId = searchParams.get("view_state_thread_id");
  const threadValues = threadInterrupts.find((t) => t.thread_id === threadId)
    ?.thread?.values;

  const removeThreadIdFromParams = React.useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      if (params.size) {
        router.push(`${pathname}?${params.toString()}`);
      } else {
        router.push(pathname);
      }
    },
    [router, pathname, searchParams]
  );

  if (!threadValues) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 w-1/2 h-screen overflow-y-auto border-l-[1px]">
      <TighterText className="pl-6 pt-16 font-medium text-3xl">
        Thread State
      </TighterText>
      <div className="flex gap-2 items-center justify-center fixed right-4 top-4">
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          variant="ghost"
          className="text-gray-600"
          size="sm"
        >
          {expanded ? (
            <ChevronsUpDown className="w-4 h-4" />
          ) : (
            <ChevronsDownUp className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={() => removeThreadIdFromParams("view_state_thread_id")}
          variant="ghost"
          className="text-gray-600"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-1 pl-6 pt-6 pr-2">
        {Object.entries(threadValues).map(([k, v], idx) => (
          <StateViewObject
            expanded={expanded}
            key={`state-view-${k}-${idx}`}
            keyName={k}
            value={v}
          />
        ))}
      </div>
    </div>
  );
}
