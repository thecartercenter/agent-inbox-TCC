import { cn } from "@/lib/utils";
import { ActionRequest, HumanInterrupt, HumanResponse } from "../types";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { prettifyText } from "../utils";

interface InboxItemInputProps {
  actionColor: { bg: string; border: string };
  interruptValue: HumanInterrupt;
  actionLetter: string;
  humanResponse: HumanResponse[];
  setHumanResponse: React.Dispatch<React.SetStateAction<HumanResponse[]>>;
}

export function InboxItemInput({
  actionColor,
  interruptValue,
  actionLetter,
  humanResponse,
  setHumanResponse,
}: InboxItemInputProps) {
  const defaultRows = React.useRef<Record<string, number>>({});

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
                      defaultRows.current[
                        k as keyof typeof defaultRows.current
                      ] = !v.length ? 3 : Math.max(v.length / 30, 7);
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
    </div>
  );
}
