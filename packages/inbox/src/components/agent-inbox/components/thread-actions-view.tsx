import { Button } from "@/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { ArrowLeft } from "lucide-react";
import { HumanInterrupt, ThreadData } from "../types";
import { prettifyText } from "../utils";
import { ThreadIdCopyable } from "./thread-id";
import { InboxItemInput } from "./inbox-item-input";
import useInterruptedActions from "../hooks/use-interrupted-actions";
import { useRouter } from "next/navigation";

interface ThreadActionsViewProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "interrupted";
    interrupts: HumanInterrupt[];
  };
  setThreadData: React.Dispatch<
    React.SetStateAction<ThreadData<ThreadValues> | undefined>
  >;
}

export function ThreadActionsView<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData, setThreadData }: ThreadActionsViewProps<ThreadValues>) {
  const {
    acceptAllowed,
    hasEdited,
    hasAddedResponse,
    streaming,
    supportsMultipleMethods,
    streamFinished,
    currentNode,
    loading,
    handleSubmit,
    handleIgnore,
    handleResolve,
    setSelectedSubmitType,
    setHasAddedResponse,
    setHasEdited,
    humanResponse,
    setHumanResponse,
    initialHumanInterruptEditValue,
  } = useInterruptedActions<ThreadValues>({
    threadData,
    setThreadData,
  });
  const router = useRouter();

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
  const threadTitle = prettifyText(
    threadData.interrupts[0].action_request.action
  );

  const actionsDisabled = loading || streaming;

  return (
    <div className="flex flex-col w-full min-h-full p-12 gap-9">
      {/* Header */}
      <div className="flex flex-col gap-6 items-start justify-start w-full">
        <Button
          variant="ghost"
          className="flex gap-2 items-center justify-center text-gray-500 w-fit"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div className="flex items-center justify-center mr-auto gap-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{
              backgroundColor: actionColor.bg,
              borderWidth: "1px",
              borderColor: actionColor.border,
            }}
          >
            {actionLetter}
          </div>
          <p className="text-2xl font-medium">{threadTitle}</p>
        </div>
        <ThreadIdCopyable threadId={threadData.thread.thread_id} />
        <div className="flex flex-row gap-4 items-center justify-start w-full">
          <Button
            variant="outline"
            className="text-gray-600 font-normal"
            size="sm"
            onClick={handleResolve}
            disabled={actionsDisabled}
          >
            Mark as Resolved
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 font-normal"
            size="sm"
            onClick={handleIgnore}
            disabled={actionsDisabled}
          >
            Ignore
          </Button>
        </div>
      </div>

      {/* Actions */}
      <InboxItemInput
        acceptAllowed={acceptAllowed}
        hasEdited={hasEdited}
        hasAddedResponse={hasAddedResponse}
        interruptValue={threadData.interrupts[0]}
        humanResponse={humanResponse}
        initialValues={initialHumanInterruptEditValue.current}
        setHumanResponse={setHumanResponse}
        streaming={streaming}
        streamFinished={streamFinished}
        currentNode={currentNode}
        supportsMultipleMethods={supportsMultipleMethods}
        setSelectedSubmitType={setSelectedSubmitType}
        setHasAddedResponse={setHasAddedResponse}
        setHasEdited={setHasEdited}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
