import { Thread } from "@langchain/langgraph-sdk";
import {
  HumanInterrupt,
  HumanResponse,
  HumanResponseWithEdits,
  SubmitType,
  ThreadData,
} from "../types";
import { useQueryParams } from "./use-query-params";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { useThreadsContext } from "../contexts/ThreadContext";
import { useRouter, usePathname, useParams } from "next/navigation";
import { createDefaultHumanResponse } from "../utils";

interface UseInterruptedActionsInput<
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

interface UseInterruptedActionsValue {
  // Actions
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  handleIgnore: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  handleResolve: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  handleResetForm: () => void;

  // State values
  streaming: boolean;
  streamFinished: boolean;
  currentNode: string;
  loading: boolean;
  threadId: string;
  isIgnoreAllowed: boolean;
  supportsMultipleMethods: boolean;
  selectedSubmitType: SubmitType | undefined;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  acceptAllowed: boolean;
  humanResponse: HumanResponseWithEdits[];

  // State setters
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}

export default function useInterruptedActions<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({
  threadData,
  setThreadData,
}: UseInterruptedActionsInput<ThreadValues>): UseInterruptedActionsValue {
  const { toast } = useToast();
  const { fetchSingleThread, sendHumanResponse, ignoreThread } =
    useThreadsContext<ThreadValues>();
  const router = useRouter();

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

  React.useEffect(() => {
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
    let errorOccurred = false;

    if (
      humanResponse.some((r) => ["response", "edit", "accept"].includes(r.type))
    ) {
      setStreamFinished(false);
      setCurrentNode("");

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
        if (!response) {
          // This will only be undefined if the graph ID is not found
          // in this case, the method will trigger a toast for us.
          return;
        }

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
          } else if (
            typeof chunk.event === "string" &&
            chunk.event === "error"
          ) {
            toast({
              title: "Error",
              description: (
                <div className="flex flex-col gap-1 items-start">
                  <p>Something went wrong while attempting to run the graph.</p>
                  <span>
                    <strong>Error:</strong>
                    <span className="font-mono">
                      {JSON.stringify(chunk.data, null)}
                    </span>
                  </span>
                </div>
              ),
              variant: "destructive",
              duration: 15000,
            });
            setCurrentNode("__error__");
            errorOccurred = true;
          }
        }

        if (!errorOccurred) {
          setStreamFinished(true);
        }
      } catch (e) {
        console.error("Error sending human response", e);
        toast({
          title: "Error",
          description: "Failed to submit response.",
          variant: "destructive",
          duration: 5000,
        });
      }

      if (!errorOccurred) {
        setCurrentNode("");
        setStreaming(false);
        const updatedThreadData = (await fetchSingleThread(
          threadData.thread.thread_id
        )) as ThreadData<ThreadValues>;
        if (updatedThreadData.status === "interrupted") {
          setThreadData(updatedThreadData);
        } else {
          router.back();
        }
        setStreamFinished(false);
      }
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
    setLoading(false);
    toast({
      title: "Successfully ignored thread",
      duration: 5000,
    });
    router.back();
  };

  const handleResolve = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);
    await ignoreThread(threadData.thread.thread_id);
    setLoading(false);
    router.back();
  };

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

  const supportsMultipleMethods =
    humanResponse.filter(
      (r) => r.type === "edit" || r.type === "accept" || r.type === "response"
    ).length > 1;

  return {
    handleSubmit,
    handleIgnore,
    handleResolve,
    handleResetForm,
    humanResponse,
    streaming,
    streamFinished,
    currentNode,
    loading,
    threadId: threadData.thread.thread_id,
    isIgnoreAllowed: !!humanResponse.find((r) => r.type === "ignore"),
    supportsMultipleMethods,
    selectedSubmitType,
    hasEdited,
    hasAddedResponse,
    acceptAllowed,
    setSelectedSubmitType,
    setHumanResponse,
    setHasAddedResponse,
    setHasEdited,
    initialHumanInterruptEditValue,
  };
}
