import { cn } from "@/lib/utils";
import {
  HumanInterrupt,
  HumanResponse,
  HumanResponseWithEdits,
  SubmitType,
  ThreadStatusWithAll,
} from "../types";
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createDefaultHumanResponse, prettifyText } from "../utils";
import { InboxItemStatuses } from "./statuses";
import { useThreadsContext } from "@/components/agent-inbox/contexts/ThreadContext";
import { InboxItemInput } from "./inbox-item-input";
import { INBOX_PARAM, VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";
import { useQueryParams } from "../hooks/use-query-params";
import { ThreadIdTooltip } from "./thread-id";
import { Thread } from "@langchain/langgraph-sdk";
import { MarkdownText } from "@/components/ui/markdown-text";
import { InboxItemFooter } from "./inbox-item-footer";

interface InterruptedInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "interrupted";
    interrupts: HumanInterrupt[];
  };
}

export function InterruptedInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData }: InterruptedInboxItem<ThreadValues>) {
  const {
    ignoreThread,
    sendHumanResponse,
    fetchThreads,
    threadData: threadDataState,
  } = useThreadsContext<ThreadValues>();
  const { toast } = useToast();
  const { searchParams, updateQueryParams, getSearchParam } = useQueryParams();

  const threadIdQueryParam = searchParams.get(VIEW_STATE_THREAD_QUERY_PARAM);
  const isStateViewOpen = !!threadIdQueryParam;
  const isCurrentThreadStateView =
    threadIdQueryParam === threadData.thread.thread_id;

  const [active, setActive] = React.useState(false);
  const [humanResponse, setHumanResponse] = React.useState<
    HumanResponseWithEdits[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [currentNode, setCurrentNode] = React.useState("");
  const [streamFinished, setStreamFinished] = React.useState(false);
  const initialHumanInterruptEditValue = React.useRef<Record<string, string>>(
    {}
  );

  const [selectedSubmitType, setSelectedSubmitType] =
    React.useState<SubmitType>();
  // Whether or not the user has edited any fields which allow editing.
  const [hasEdited, setHasEdited] = React.useState(false);
  // Whether or not the user has added a response.
  const [hasAddedResponse, setHasAddedResponse] = React.useState(false);
  const [acceptAllowed, setAcceptAllowed] = React.useState(false);

  const actionTypeColorMap = {
    question: { bg: "#FCA5A5", border: "#EF4444" },
    notify: { bg: "#93C5FD", border: "#3B82F6" },
  };
  const actionType = threadData.interrupts[0].action_request.action;
  const actionColor =
    actionType.toLowerCase() in actionTypeColorMap
      ? actionTypeColorMap[
          actionType.toLowerCase() as keyof typeof actionTypeColorMap
        ]
      : { bg: "#FDBA74", border: "#F97316" };
  const actionLetter = actionType.slice(0, 1).toUpperCase();
  const isIgnoreAllowed = threadData.interrupts.every(
    (v) => v.config.allow_ignore
  );

  const handleToggleViewState = () => {
    const threadId = threadData.thread.thread_id;
    updateQueryParams(VIEW_STATE_THREAD_QUERY_PARAM, threadId);
  };

  useEffect(() => {
    if (!threadData.interrupts) return;
    const { responses, defaultSubmitType, hasAccept } =
      createDefaultHumanResponse(
        threadData.interrupts,
        initialHumanInterruptEditValue
      );
    setSelectedSubmitType(defaultSubmitType);
    setHumanResponse(responses);
    setAcceptAllowed(hasAccept);
  }, [threadData.interrupts]);

  useEffect(() => {
    const threadIdParam = getSearchParam(VIEW_STATE_THREAD_QUERY_PARAM);
    if (active) return;
    if (threadIdParam === threadData.thread.thread_id && !active) {
      setActive(true);
    }
  }, [searchParams, threadDataState]);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!humanResponse) {
      toast({
        title: "Error",
        description: "Please enter a response.",
        duration: 5000,
      });
      return;
    }
    const selectedInbox = getSearchParam(INBOX_PARAM) as
      | ThreadStatusWithAll
      | undefined;
    if (!selectedInbox) {
      toast({
        title: "Error",
        description: "No inbox selected",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (
      humanResponse.some((r) => ["response", "edit", "accept"].includes(r.type))
    ) {
      setStreamFinished(false);

      try {
        const humanResponseInput: HumanResponse[] = humanResponse.flatMap(
          (r) => {
            if (r.type === "edit") {
              if (r.acceptAllowed && !r.editsMade) {
                return {
                  type: "accept",
                  args: r.args,
                };
              } else {
                return {
                  type: "edit",
                  args: r.args,
                };
              }
            }

            if (r.type === "response" && !r.args) {
              // If response was allowed but no response was given, do not include in the response
              return [];
            }
            return {
              type: r.type,
              args: r.args,
            };
          }
        );

        const input = humanResponseInput.find(
          (r) => r.type === selectedSubmitType
        );
        if (!input) {
          toast({
            title: "Error",
            description: "No response found.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        setLoading(true);
        setStreaming(true);
        const response = sendHumanResponse(
          threadData.thread.thread_id,
          [input],
          {
            stream: true,
          }
        );

        toast({
          title: "Success",
          description: "Response submitted successfully.",
          duration: 5000,
        });

        for await (const chunk of response) {
          if (
            chunk.data?.event === "on_chain_start" &&
            chunk.data?.metadata?.langgraph_node
          ) {
            setCurrentNode(chunk.data.metadata.langgraph_node);
          }
        }

        setStreamFinished(true);
      } catch (e) {
        console.error("Error sending human response", e);
        toast({
          title: "Error",
          description: "Failed to submit response.",
          variant: "destructive",
          duration: 5000,
        });
      }

      setCurrentNode("");
      setStreaming(false);
      // Fetch new threads so that the inbox item is updated.
      await fetchThreads(selectedInbox);
      setStreamFinished(false);
    } else {
      setLoading(true);
      await sendHumanResponse(threadData.thread.thread_id, humanResponse);

      toast({
        title: "Success",
        description: "Response submitted successfully.",
        duration: 5000,
      });
    }

    setLoading(false);
    setActive(false);
  };

  const handleIgnore = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const ignoreResponse = humanResponse.find((r) => r.type === "ignore");
    if (!ignoreResponse) {
      toast({
        title: "Error",
        description: "The selected thread does not support ignoring.",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    await sendHumanResponse(threadData.thread.thread_id, [ignoreResponse]);
    const selectedInbox = getSearchParam(INBOX_PARAM) as
      | ThreadStatusWithAll
      | "interrupted";
    await fetchThreads(selectedInbox);
    setLoading(true);
    setActive(false);
  };

  const handleResolve = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);
    await ignoreThread(threadData.thread.thread_id);
    setLoading(false);
    setActive(false);
  };

  const descriptionPreview =
    threadData.interrupts[0].description &&
    threadData.interrupts[0].description.slice(0, 75);
  const descriptionTruncated =
    threadData.interrupts[0].description &&
    threadData.interrupts[0].description.length > 75;

  const supportsMultipleMethods =
    humanResponse.filter((r) => r.type === "response" || r.type === "edit")
      .length > 1;

  const handleResetForm = () => {
    initialHumanInterruptEditValue.current = {};
    const { responses, defaultSubmitType, hasAccept } =
      createDefaultHumanResponse(
        threadData.interrupts,
        initialHumanInterruptEditValue
      );
    setAcceptAllowed(hasAccept);
    setSelectedSubmitType(defaultSubmitType);
    setHumanResponse(responses);
    setHasAddedResponse(false);
    setHasEdited(false);
  };

  return (
    <div
      onClick={() => {
        if (!active) {
          setActive(true);
          handleToggleViewState();
        }
      }}
      className={cn(
        "flex flex-col gap-6 items-start justify-start",
        "transition-all ease-in-out",
        "rounded-xl border-[1px] ",
        "p-6 min-h-[50px] border-gray-200",
        !active && "cursor-pointer",
        isStateViewOpen ? "max-w-[60%] w-full" : "w-full",
        isCurrentThreadStateView && "border-gray-300 shadow-md"
      )}
    >
      <motion.span
        animate={{ marginBottom: active ? "0px" : "0px" }}
        className="flex flex-col gap-3 items-center justify-start w-full"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center justify-start gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
              style={{
                backgroundColor: actionColor.bg,
                borderWidth: "1px",
                borderColor: actionColor.border,
              }}
            >
              {actionLetter}
            </div>
            <p className="font-semibold">
              {prettifyText(threadData.interrupts[0].action_request.action)}
            </p>
            <ThreadIdTooltip threadId={threadData.thread.thread_id} />
          </div>
          {!isCurrentThreadStateView && !active && (
            <InboxItemStatuses config={threadData.interrupts[0].config} />
          )}
        </div>

        {descriptionPreview && !active && (
          <p className="text-sm text-gray-500 mr-auto flex gap-1">
            <strong>Agent Response: </strong>
            <MarkdownText>
              {`${descriptionPreview}${descriptionTruncated ? "..." : ""}`}
            </MarkdownText>
          </p>
        )}
      </motion.span>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 items-start w-full overflow-hidden"
          >
            {/* TODO: HANDLE ARRAY OF INTERRUPT VALUES */}
            <div className="flex flex-col gap-4 items-start w-full">
              <InboxItemInput
                acceptAllowed={acceptAllowed}
                hasEdited={hasEdited}
                hasAddedResponse={hasAddedResponse}
                interruptValue={threadData.interrupts[0]}
                humanResponse={humanResponse}
                initialValues={initialHumanInterruptEditValue.current}
                setHumanResponse={setHumanResponse}
                streaming={streaming}
                supportsMultipleMethods={supportsMultipleMethods}
                setSelectedSubmitType={setSelectedSubmitType}
                setHasAddedResponse={setHasAddedResponse}
                setHasEdited={setHasEdited}
              />
            </div>
            <InboxItemFooter
              acceptAllowed={acceptAllowed}
              streaming={streaming}
              streamFinished={streamFinished}
              currentNode={currentNode}
              loading={loading}
              threadId={threadData.thread.thread_id}
              isIgnoreAllowed={isIgnoreAllowed}
              handleSubmit={handleSubmit}
              handleIgnore={handleIgnore}
              handleResolve={handleResolve}
              setActive={setActive}
              handleToggleViewState={handleToggleViewState}
              supportsMultipleMethods={supportsMultipleMethods}
              setSelectedSubmitType={setSelectedSubmitType}
              selectedSubmitType={selectedSubmitType}
              hasEdited={hasEdited}
              hasAddedResponse={hasAddedResponse}
              handleResetForm={handleResetForm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
