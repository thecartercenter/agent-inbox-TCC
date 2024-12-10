import { ChevronRight, X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  baseMessageObject,
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
import { ToolCallTable } from "./tool-call-table";
import { MarkdownText } from "@/components/ui/markdown-text";
import { ThreadData } from "../types";

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

const dummyDescription = `Schedule post

The following post was generated for Twitter/LinkedIn:


📝🤖 Open Canvas

An open-source document editor that brings AI agents to your writing workflow. Featuring persistent memory and document import support, it uses LangGraph to enable seamless human-AI collaboration on code and markdown files.

Start collaborating with AI today 👉 https://github.com/langchain-ai/open-canvas

Instructions

There are a few different actions which can be taken:



Edit: If the post is edited and submitted, it will be scheduled for Twitter/LinkedIn.

Respond: If a response is sent, it will be used to rewrite the post. Please note, the response will be used as the 'user' message in an LLM call to rewrite the post, so ensure your response is properly formatted.

Accept: If 'accept' is selected, the post will be scheduled for Twitter/LinkedIn.

Ignore: If 'ignore' is selected, this post will not be scheduled, and the thread will end.


The date the post will be scheduled for may be edited, but it must follow the format 'MM/dd/yyyy hh:mm a'.


Here is the report that was generated for the posts:


Part 1: Introduction and Summary

Open Canvas is an open-source web application that enables collaborative document writing with AI agents. It serves as an alternative to OpenAI's Canvas, offering unique capabilities like built-in memory systems and the ability to start from existing documents. The platform allows users to collaborate with AI agents on both code and markdown documents, featuring live rendering and versioning capabilities.


Key differentiators include:



MIT licensed open-source codebase

Built-in reflection agent with persistent memory

Support for existing document imports

Custom and pre-built quick actions

Artifact versioning system


Part 2: LangChain Implementation

Open Canvas leverages multiple LangChain products:



LangGraph: Powers the core agent architecture, including the reflection agent and content generation systems. The application uses LangGraph's shared memory store for maintaining context across sessions.

LangSmith: Provides production deployment capabilities through LangGraph Cloud, enabling scalable hosting of the agent systems.


The integration of these technologies enables sophisticated features like persistent memory across sessions, automated reflections, and seamless agent interactions.


Part 3: Technical Details

The application supports multiple LLM models including:



Anthropic Claude 3 Haiku

Fireworks Llama 3 70B

OpenAI GPT 4o Mini


Technical highlights:



Full-stack JavaScript/TypeScript implementation

Extensible model support system

Built-in versioning for all artifacts

Dual-mode editing for code and markdown

Custom quick actions persistence


The platform is actively developed with a clear roadmap including planned features like React rendering, multiple assistants, and custom tool integration.


Try it out: opencanvas.langchain.com
GitHub Repository: github.com/langchain-ai/open-canvas


Here are the relevant links used for generating the report & posts:



https://github.com/langchain-ai/open-canvas`;

interface StateViewComponentProps {
  threadData: ThreadData<Record<string, any>>;
  handleShowSidePanel: (showState: boolean, showDescription: boolean) => void;
  view: "description" | "state";
}

export function StateView({
  threadData,
  handleShowSidePanel,
  view,
}: StateViewComponentProps) {
  const [expanded, setExpanded] = useState(false);

  const threadValues = threadData.thread.values;
  const description = threadData.interrupts?.[0].description;

  if (!threadValues) {
    return <div>No state found</div>;
  }

  return (
    <div className="overflow-y-auto pl-6 border-t-[1px] lg:border-l-[1px] border-gray-100 flex flex-row gap-0 w-full">
      {view === "description" && (
        <div className="pt-6 pb-2">
          <MarkdownText className="text-wrap break-all break-words whitespace-pre-wrap">
            {description || "No description provided"}
          </MarkdownText>
        </div>
      )}
      {view === "state" && (
        <div className="flex flex-col items-start justify-start gap-1 pt-6 pb-2">
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
      <div className="flex gap-2 items-start justify-end pt-6 pr-6">
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
          onClick={() => handleShowSidePanel(false, false)}
          variant="ghost"
          className="text-gray-600"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
