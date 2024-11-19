import { cn } from "@/lib/utils";
import {
  ActionRequest,
  HumanInterrupt,
  HumanResponse,
  ThreadInterruptData,
} from "./types";
import { Textarea } from "../ui/textarea";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { prettifyText } from "./utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { InboxItemStatuses } from "./components/statuses";
import { useThreadsContext } from "@/contexts/ThreadContext";

interface InboxItemInputProps {
  actionColor: { bg: string; border: string };
  interruptValue: HumanInterrupt;
  actionLetter: string;
  humanResponse: HumanResponse[];
  setHumanResponse: React.Dispatch<React.SetStateAction<HumanResponse[]>>;
}

function InboxItemInput({
  actionColor,
  interruptValue,
  actionLetter,
  humanResponse,
  setHumanResponse,
}: InboxItemInputProps) {
  return (
    <div
      className={cn(
        "w-full p-3 flex flex-row items-start justify-start gap-4",
        "rounded-lg border-[1px] border-gray-100 shadow-sm"
      )}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] leading-3"
        style={{
          backgroundColor: actionColor.bg,
          borderWidth: "1px",
          borderColor: actionColor.border,
        }}
      >
        {actionLetter}
      </div>
      <div className="flex flex-col gap-2 items-start w-full">
        {!interruptValue.config.allow_edit && (
          <div className="flex flex-col gap-1 items-start justify-start mr-auto">
            {Object.entries(interruptValue.action_request.args).map(
              ([k, v]) => {
                let value = "";
                if (["string", "number"].includes(typeof v)) {
                  value = v as string;
                } else {
                  value = JSON.stringify(v, null);
                }

                return (
                  <div
                    key={`args-${k}`}
                    className="p-2 rounded-lg items-center justify-start w-full bg-gray-50 border-[1px] border-gray-300"
                  >
                    <p className="text-sm text-gray-600">
                      <strong>{prettifyText(k)}: </strong>
                      {value}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        )}
        {interruptValue.description && (
          <p className="text-sm font-medium">{interruptValue.description}</p>
        )}
        <div className="flex flex-col gap-2 items-start w-full">
          {humanResponse.map((response, idx) => (
            <div
              className="flex flex-col gap-1 items-start w-full"
              key={`human-res-${response.type}-${idx}`}
            >
              {typeof response.args === "object" && response.args && (
                <>
                  {Object.entries(response.args.args).map(([k, v], idx) => (
                    <div
                      className="flex flex-col gap-1 items-start w-full"
                      key={`allow-edit-args-${k}-${idx}`}
                    >
                      <p className="text-sm min-w-fit">{prettifyText(k)}: </p>
                      <Textarea
                        value={v}
                        onChange={(e) => {
                          setHumanResponse((prev) => {
                            if (
                              typeof response.args !== "object" ||
                              !response.args
                            ) {
                              console.error(
                                "Mismatched response type",
                                !!response.args,
                                typeof response.args
                              );
                              return prev;
                            }

                            const newEdit: HumanResponse = {
                              type: response.type,
                              args: {
                                action: response.args.action,
                                args: {
                                  ...response.args.args,
                                  [k]: e.target.value,
                                },
                              },
                            };
                            if (
                              prev.find(
                                (p) =>
                                  p.type === response.type &&
                                  typeof p.args === "object" &&
                                  p.args?.action ===
                                    (response.args as ActionRequest).action
                              )
                            ) {
                              return prev.map((p) => {
                                if (
                                  p.type === response.type &&
                                  typeof p.args === "object" &&
                                  p.args?.action ===
                                    (response.args as ActionRequest).action
                                ) {
                                  return newEdit;
                                }
                                return p;
                              });
                            }
                            return [...prev, newEdit];
                          });
                        }}
                        className="w-full"
                        rows={2}
                      />
                    </div>
                  ))}
                </>
              )}
              {typeof response.args === "string" && (
                <Textarea
                  value={response.args}
                  onChange={(e) => {
                    setHumanResponse((prev) => {
                      const newResponse: HumanResponse = {
                        type: response.type,
                        args: e.target.value,
                      };

                      if (prev.find((p) => p.type === response.type)) {
                        return prev.map((p) => {
                          if (p.type === response.type) {
                            return newResponse;
                          }
                          return p;
                        });
                      }
                      return [...prev, newResponse];
                    });
                  }}
                  rows={2}
                  placeholder="Your response here..."
                  className="w-full"
                />
              )}
              {/* TODO: Handle accept/ignore. This should be okay to leave for now since the email assistant is setup to set `accept`/`ignore` to true alongside `edit`. */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  interruptData: ThreadInterruptData<ThreadValues>;
  threadContextRenderer?: React.ReactNode;
}

export function InboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ interruptData }: InboxItemProps<ThreadValues>) {
  const { ignoreThread, sendHumanResponse } = useThreadsContext<ThreadValues>();
  const { interrupt_value } = interruptData;
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [active, setActive] = React.useState(false);
  const [humanResponse, setHumanResponse] = React.useState<HumanResponse[]>([]);
  const [loading, setLoading] = React.useState(false);

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

  const updateQueryParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleToggleViewState = () => {
    const threadId = interruptData.thread_id;
    updateQueryParam("view_state_thread_id", threadId);
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
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    setActive(false);
                    const currQueryParamThreadId = searchParams.get(
                      "view_state_thread_id"
                    );
                    if (currQueryParamThreadId === interruptData.thread_id) {
                      updateQueryParam("view_state_thread_id", "");
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
                  onClick={async () => {
                    if (!humanResponse) {
                      toast({
                        title: "Error",
                        description: "Please enter a response.",
                        duration: 5000,
                      });
                      return;
                    }
                    setLoading(true);

                    await sendHumanResponse(
                      interruptData.thread_id,
                      humanResponse
                    );

                    toast({
                      title: "Success",
                      description: "Response submitted successfully.",
                      duration: 5000,
                    });
                    setLoading(false);
                    setActive(false);
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
