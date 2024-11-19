import { cn } from "@/lib/utils";
import { HumanResponse, ThreadInterruptData } from "../types";
import React, { useEffect } from "react";
import { Button } from "../../ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { prettifyText } from "../utils";
import { InboxItemStatuses } from "./statuses";
import { useThreadsContext } from "@/contexts/ThreadContext";
import { InboxItemInput } from "./inbox-item-input";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";
import { useQueryParams } from "../hooks/use-query-params";
import { LoaderCircle } from "lucide-react";
import { ThreadIdTooltip } from "./thread-id-tooltip";

interface InboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  interruptData: ThreadInterruptData<ThreadValues>;
  threadContextRenderer?: React.ReactNode;
}

export function InboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ interruptData }: InboxItemProps<ThreadValues>) {
  const { ignoreThread, sendHumanResponse, fetchThreads } =
    useThreadsContext<ThreadValues>();
  const { interrupt_value } = interruptData;
  const { toast } = useToast();
  const { searchParams, updateQueryParam } = useQueryParams();

  const [active, setActive] = React.useState(false);
  const [humanResponse, setHumanResponse] = React.useState<HumanResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [currentNode, setCurrentNode] = React.useState("");
  const [streamFinished, setStreamFinished] = React.useState(false);

  const actionTypeColorMap = {
    question: { bg: "#FCA5A5", border: "#EF4444" },
    notify: { bg: "#93C5FD", border: "#3B82F6" },
  };
  const actionType = interrupt_value[0].action_request.action;
  const actionColor =
    actionType.toLowerCase() in actionTypeColorMap
      ? actionTypeColorMap[
          actionType.toLowerCase() as keyof typeof actionTypeColorMap
        ]
      : { bg: "#FDBA74", border: "#F97316" };
  const actionLetter = actionType.slice(0, 1).toUpperCase();
  const isIgnoreAllowed = interrupt_value.every((v) => v.config.allow_ignore);

  const handleToggleViewState = () => {
    const threadId = interruptData.thread_id;
    updateQueryParam(VIEW_STATE_THREAD_QUERY_PARAM, threadId);
  };

  useEffect(() => {
    if (!interruptData.interrupt_value) return;
    const defaultHumanResponse: HumanResponse[] =
      interruptData.interrupt_value.flatMap((v) => {
        if (v.config.allow_edit) {
          return {
            type: "edit",
            args: v.action_request,
          };
        }
        if (v.config.allow_respond) {
          return {
            type: "response",
            args: "",
          };
        }
        if (v.config.allow_accept) {
          return {
            type: "accept",
            args: null,
          };
        }
        if (v.config.allow_ignore) {
          return {
            type: "ignore",
            args: null,
          };
        }

        return [];
      });

    setHumanResponse(defaultHumanResponse);
  }, []);

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

    setLoading(true);

    if (
      humanResponse.some((r) => ["response", "edit", "accept"].includes(r.type))
    ) {
      toast({
        title: "Success",
        description: "Response submitted successfully.",
        duration: 5000,
      });
      setStreaming(true);
      setStreamFinished(false);

      try {
        const response = sendHumanResponse(
          interruptData.thread_id,
          humanResponse,
          {
            stream: true,
          }
        );

        for await (const chunk of response) {
          if (
            chunk.data?.event === "on_chain_start" &&
            chunk.data?.metadata?.langgraph_node
          ) {
            setCurrentNode(chunk.data.metadata.langgraph_node);
          }
          console.log(chunk);
        }

        setStreamFinished(true);
      } catch (e) {
        // Something went wrong.
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
      // Void so we do not block.
      await fetchThreads();
      setStreamFinished(false);
      console.log("Finished!");
    } else {
      await sendHumanResponse(interruptData.thread_id, humanResponse);

      toast({
        title: "Success",
        description: "Response submitted successfully.",
        duration: 5000,
      });
    }

    setLoading(false);
    setActive(false);
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
        "rounded-xl border-[1px] ",
        "p-6 min-h-[50px]",
        active ? "border-gray-200 shadow-md" : "border-gray-200/75",
        !active && "cursor-pointer",
        "max-w-[45%] w-full"
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
              {prettifyText(interrupt_value[0].action_request.action)}
            </p>
            <ThreadIdTooltip threadId={interruptData.thread_id} />
          </div>
          <InboxItemStatuses config={interrupt_value[0].config} />
        </div>

        {interrupt_value[0].description && (
          <p className="text-sm text-gray-500 mr-auto">
            <strong>Agent Response: </strong>
            {interrupt_value[0].description}
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
            {/* <div className="flex flex-col gap-4 items-start w-full">
              {interrupt_value.map((value, idx) => (
                <InboxItemInput
                  key={`inbox-item-input-${idx}`}
                  actionColor={actionColor}
                  actionLetter={actionLetter}
                  interruptValue={value}
                />
              ))}
            </div> */}
            <div className="flex flex-col gap-4 items-start w-full">
              <InboxItemInput
                actionColor={actionColor}
                actionLetter={actionLetter}
                interruptValue={interrupt_value[0]}
                humanResponse={humanResponse}
                setHumanResponse={setHumanResponse}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2 items-center justify-start">
                <p
                  onClick={() => handleToggleViewState()}
                  className="text-gray-700 hover:text-black transition-colors ease-in-out font-medium underline underline-offset-2 cursor-pointer"
                >
                  View State
                </p>
              </div>
              <div className="flex gap-2 items-center justify-end">
                {streaming && !currentNode && (
                  <p className="text-sm text-gray-600">
                    Waiting for Graph to start...
                  </p>
                )}
                {streaming && currentNode && (
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600 flex items-center justify-start gap-1">
                      <p>Running</p>
                      <LoaderCircle className="w-3 h-3 animate-spin" />
                    </span>
                    <p className="text-black text-sm font-mono">
                      <span className="font-sans text-gray-700">Node: </span>
                      {prettifyText(currentNode)}
                    </p>
                  </div>
                )}
                {streamFinished && (
                  <p className="text-base text-green-600 font-medium">
                    Successfully finished Graph invocation.
                  </p>
                )}
                {!streaming && !streamFinished && (
                  <>
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        setActive(false);
                        const currQueryParamThreadId = searchParams.get(
                          VIEW_STATE_THREAD_QUERY_PARAM
                        );
                        if (
                          currQueryParamThreadId === interruptData.thread_id
                        ) {
                          updateQueryParam(VIEW_STATE_THREAD_QUERY_PARAM);
                        }
                      }}
                    >
                      Close
                    </Button>
                    {isIgnoreAllowed && (
                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true);

                          await ignoreThread(interruptData.thread_id);

                          setLoading(true);
                          setActive(false);
                        }}
                        className="border-red-500 text-red-500 hover:text-red-600"
                      >
                        Ignore
                      </Button>
                    )}
                    <Button
                      variant="default"
                      disabled={loading}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
