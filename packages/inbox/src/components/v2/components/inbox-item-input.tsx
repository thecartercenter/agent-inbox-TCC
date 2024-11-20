import { cn } from "@/lib/utils";
import { ActionRequest, HumanInterrupt, HumanResponse } from "../types";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { prettifyText } from "../utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InboxItemInputProps {
  interruptValue: HumanInterrupt;
  humanResponse: HumanResponse[];
  streaming: boolean;
  setHumanResponse: React.Dispatch<React.SetStateAction<HumanResponse[]>>;
}

export function InboxItemInput({
  interruptValue,
  humanResponse,
  streaming,
  setHumanResponse,
}: InboxItemInputProps) {
  const defaultRows = React.useRef<Record<string, number>>({});

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-2",
        "shadow-sm"
      )}
    >
      {!interruptValue.config.allow_edit && (
        <div className="flex flex-col gap-1 items-start justify-start mr-auto">
          {Object.entries(interruptValue.action_request.args).map(([k, v]) => {
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
                <p className="text-sm text-gray-600 flex gap-1">
                  <strong>{prettifyText(k)}: </strong>
                  <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
                </p>
              </div>
            );
          })}
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
                {Object.entries(response.args.args).map(([k, v], idx) => {
                  const value = ["string", "number"].includes(typeof v)
                    ? v
                    : JSON.stringify(v, null);
                  // Calculate the default number of rows by the total length of the initial value divided by 30
                  // or 8, whichever is greater. Stored in a ref to prevent re-rendering.
                  if (
                    defaultRows.current[
                      k as keyof typeof defaultRows.current
                    ] === undefined
                  ) {
                    defaultRows.current[k as keyof typeof defaultRows.current] =
                      !v.length ? 3 : Math.max(v.length / 30, 7);
                  }
                  const numRows =
                    defaultRows.current[
                      k as keyof typeof defaultRows.current
                    ] || 8;

                  return (
                    <div
                      className="flex flex-col gap-1 items-start w-full h-full"
                      key={`allow-edit-args--${k}-${idx}`}
                    >
                      <p className="text-sm min-w-fit">{prettifyText(k)}: </p>
                      <Textarea
                        disabled={streaming}
                        className="h-full"
                        value={value}
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
                        rows={numRows}
                      />
                    </div>
                  );
                })}
              </>
            )}
            {typeof response.args === "string" && (
              <Textarea
                disabled={streaming}
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
                rows={8}
                placeholder="Your response here..."
              />
            )}
            {/* TODO: Handle accept/ignore. This should be okay to leave for now since the email assistant is setup to set `accept`/`ignore` to true alongside `edit`. */}
          </div>
        ))}
      </div>
    </div>
  );
}
