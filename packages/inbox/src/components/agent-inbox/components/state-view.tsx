import { ChevronRight, X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  baseMessageObject,
  constructOpenInStudioURL,
  isArrayOfMessages,
  prettifyText,
  unknownToPrettyDate,
} from "../utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BaseMessage } from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import React from "react";
import { Button } from "../../ui/button";
import { useThreadsContext } from "@/components/agent-inbox/contexts/ThreadContext";
import { ToolCallTable } from "./tool-call-table";
import { useQueryParams } from "../hooks/use-query-params";
import {
  STUDIO_URL_LOCAL_STORAGE_KEY,
  VIEW_STATE_THREAD_QUERY_PARAM,
} from "../constants";
import NextImage from "next/image";
import GraphIcon from "@/components/icons/GraphIcon.svg";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { ThreadIdCopyable } from "./thread-id";
import { PillButton } from "@/components/ui/pill-button";
import { MarkdownText } from "@/components/ui/markdown-text";

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

function MessagesRenderer({ messages }: { messages: BaseMessage[] }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {messages.map((msg, idx) => {
        const messageTypeLabel = messageTypeToLabel(msg);
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content, null);
        return (
          <div
            key={msg.id || `message-${idx}`}
            className="flex flex-col gap-[2px] ml-2 w-full"
          >
            <p className="font-medium text-gray-700">{messageTypeLabel}:</p>
            {content && (
              <MarkdownText className="text-gray-600">{content}</MarkdownText>
            )}
            {"tool_calls" in msg && msg.tool_calls ? (
              <div className="flex flex-col gap-1 items-start w-full">
                {(msg.tool_calls as ToolCall[]).map((tc, idx) => (
                  <ToolCallTable
                    key={tc.id || `tool-call-${idx}`}
                    toolCall={tc}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function StateViewRecursive(props: StateViewRecursiveProps) {
  const date = unknownToPrettyDate(props.value);
  if (date) {
    return <p className="font-light text-gray-600">{date}</p>;
  }

  if (["string", "number"].includes(typeof props.value)) {
    return (
      <MarkdownText className="font-light text-gray-600">
        {props.value as string}
      </MarkdownText>
    );
  }

  if (typeof props.value === "boolean") {
    return (
      <MarkdownText className="font-light text-gray-600">
        {JSON.stringify(props.value)}
      </MarkdownText>
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
      <div className="flex flex-row gap-1 items-start justify-start w-full">
        <span className="font-normal text-black">[</span>
        {valueArray.map((item, idx) => {
          const itemRenderValue = baseMessageObject(item);
          return (
            <div
              key={`state-view-${idx}`}
              className="flex flex-row items-start whitespace-pre-wrap w-full"
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
      <div className="flex flex-col gap-1 items-start justify-start ml-6 relative w-full">
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
      <div className="flex flex-col gap-1 items-start justify-start w-full">
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
          className="relative w-full"
        >
          <StateViewRecursive expanded={props.expanded} value={props.value} />
        </motion.div>
      </div>
    </div>
  );
}

export function StateView() {
  const { updateQueryParams, searchParams } = useQueryParams();
  const [expanded, setExpanded] = useState(false);
  const { threadData } = useThreadsContext();
  const { getItem } = useLocalStorage();
  const { toast } = useToast();
  const deploymentUrl = getItem(STUDIO_URL_LOCAL_STORAGE_KEY);
  const [view, setView] = useState<"description" | "state">("description");

  const threadIdParam = searchParams.get(VIEW_STATE_THREAD_QUERY_PARAM);
  const threadValues = threadData.find(
    ({ thread }) => thread.thread_id === threadIdParam
  )?.thread?.values;
  const description = threadData.find(
    (t) => t.thread.thread_id === threadIdParam
  )?.interrupts?.[0].description;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!threadValues || !threadIdParam) {
      updateQueryParams(VIEW_STATE_THREAD_QUERY_PARAM);
    }
  }, [threadValues, threadIdParam]);

  if (!threadValues || !threadIdParam) {
    return null;
  }

  const handleOpenInStudio = () => {
    if (!deploymentUrl) {
      toast({
        title: "Error",
        description: "Please set the LangGraph deployment URL in settings.",
        duration: 5000,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(deploymentUrl, threadIdParam);
    window.open(studioUrl, "_blank");
  };

  return (
    <div className="fixed top-0 right-0 w-[40%] h-screen overflow-y-auto border-l-[1px] pl-6 bg-gray-50/10 shadow-inner-left">
      <div className="flex flex-col pt-8 gap-3 items-start">
        <div className="flex flex-wrap gap-3 items-center w-full">
          <PillButton
            onClick={() => setView("description")}
            variant={view === "description" ? "default" : "outline"}
          >
            Description
          </PillButton>
          <PillButton
            onClick={() => setView("state")}
            variant={view === "state" ? "default" : "outline"}
          >
            State
          </PillButton>
          {deploymentUrl && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleOpenInStudio}
            >
              <NextImage
                src={GraphIcon}
                height={16}
                width={16}
                alt="LangGraph Icon"
              />
              <span>Open in Studio</span>
            </Button>
          )}
        </div>
        <ThreadIdCopyable threadId={threadIdParam} />
      </div>
      {view === "description" && (
        <div className="flex flex-col gap-1 pt-6 pb-2 w-[90%] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <MarkdownText>
            {description || "No description provided"}
          </MarkdownText>
        </div>
      )}
      <div className="flex gap-2 items-center justify-center fixed right-4 top-8">
        {view === "state" && (
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
        )}

        <Button
          onClick={() => updateQueryParams(VIEW_STATE_THREAD_QUERY_PARAM)}
          variant="ghost"
          className="text-gray-600"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {view === "state" && (
        <div className="flex flex-col gap-1 pt-6 pb-2 w-[90%]">
          {Object.entries(threadValues).map(([k, v], idx) => (
            <StateViewObject
              expanded={expanded}
              key={`state-view-${k}-${idx}`}
              keyName={k}
              value={v}
            />
          ))}
        </div>
      )}
    </div>
  );
}
