import { cn } from "@/lib/utils";
import {
  ActionRequest,
  HumanInterrupt,
  HumanResponseWithEdits,
  SubmitType,
} from "../types";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { haveArgsChanged, prettifyText } from "../utils";
import { MarkdownText } from "@/components/ui/markdown-text";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CircleX, LoaderCircle, Undo2 } from "lucide-react";

interface InboxItemInputProps {
  interruptValue: HumanInterrupt;
  humanResponse: HumanResponseWithEdits[];
  supportsMultipleMethods: boolean;
  acceptAllowed: boolean;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  initialValues: Record<string, string>;

  streaming: boolean;
  streamFinished: boolean;
  currentNode: string;

  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;

  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
}

const ResponseComponent = ({
  humanResponse,
  streaming,
  showArgsInResponse,
  interruptValue,
  onResponseChange,
  handleSubmit,
}: {
  humanResponse: HumanResponseWithEdits[];
  streaming: boolean;
  showArgsInResponse: boolean;
  interruptValue: any;
  onResponseChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    response: HumanResponseWithEdits
  ) => void;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
}) => {
  const res = humanResponse.find((r) => r.type === "response");
  if (!res || typeof res.args !== "string") {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-6 items-start w-full rounded-xl border-[1px] border-gray-300">
      <div className="flex items-center justify-between w-full">
        <p className="font-semibold text-black text-base">Respond</p>
        <Button
          variant="ghost"
          className="flex items-center justify-center gap-2 text-gray-500"
        >
          <Undo2 className="w-4 h-4" />
          <span>Reset</span>
        </Button>
      </div>

      {showArgsInResponse && (
        <div className="flex flex-col gap-6 items-start w-full">
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
                className="flex flex-col gap-1 items-start w-full"
              >
                <p className="text-sm leading-[18px] text-gray-600">
                  {prettifyText(k)}:
                </p>
                <span className="text-[13px] leading-[18px] text-black bg-zinc-100 rounded-xl p-3">
                  <MarkdownText>{value}</MarkdownText>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-[6px] items-start w-full">
        <p className="text-sm min-w-fit font-medium">Response</p>
        <Textarea
          disabled={streaming}
          value={res.args}
          onChange={(e) => onResponseChange(e, res)}
          rows={4}
          placeholder="Your response here..."
        />
      </div>

      <div className="flex items-center justify-end w-full gap-2">
        <Button disabled={streaming} onClick={handleSubmit}>
          Send Response
        </Button>
      </div>
    </div>
  );
};

const Response = React.memo(ResponseComponent);

export function InboxItemInput({
  interruptValue,
  humanResponse,
  streaming,
  streamFinished,
  currentNode,
  supportsMultipleMethods,
  acceptAllowed,
  hasEdited,
  hasAddedResponse,
  initialValues,
  setHumanResponse,
  setSelectedSubmitType,
  setHasEdited,
  setHasAddedResponse,
  handleSubmit,
}: InboxItemInputProps) {
  const defaultRows = React.useRef<Record<string, number>>({});
  const isEditAllowed = interruptValue.config.allow_edit;
  const isResponseAllowed = interruptValue.config.allow_respond;
  const hasArgs = Object.entries(interruptValue.action_request.args).length > 0;
  const showArgsInResponse =
    hasArgs && !isEditAllowed && !acceptAllowed && isResponseAllowed;
  const showArgsOutsideActionCards = hasArgs && !showArgsInResponse;
  const isError = currentNode === "__error__";

  const onEditChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    response: HumanResponseWithEdits,
    key: string
  ) => {
    let valuesChanged = true;
    if (typeof response.args === "object") {
      const haveValuesChanged = haveArgsChanged(
        {
          ...(response.args?.args || {}),
          [key]: e.target.value,
        },
        initialValues
      );
      valuesChanged = haveValuesChanged;
    }

    if (!valuesChanged) {
      setHasEdited(false);
      if (acceptAllowed) {
        setSelectedSubmitType("accept");
      } else if (hasAddedResponse) {
        setSelectedSubmitType("response");
      }
    } else {
      setSelectedSubmitType("edit");
      setHasEdited(true);
    }

    setHumanResponse((prev) => {
      if (typeof response.args !== "object" || !response.args) {
        console.error(
          "Mismatched response type",
          !!response.args,
          typeof response.args
        );
        return prev;
      }

      const newEdit: HumanResponseWithEdits = {
        type: response.type,
        args: {
          action: response.args.action,
          args: {
            ...response.args.args,
            [key]: e.target.value,
          },
        },
      };
      if (
        prev.find(
          (p) =>
            p.type === response.type &&
            typeof p.args === "object" &&
            p.args?.action === (response.args as ActionRequest).action
        )
      ) {
        return prev.map((p) => {
          if (
            p.type === response.type &&
            typeof p.args === "object" &&
            p.args?.action === (response.args as ActionRequest).action
          ) {
            if (p.acceptAllowed) {
              return {
                ...newEdit,
                acceptAllowed: true,
                editsMade: valuesChanged,
              };
            }

            return newEdit;
          }
          return p;
        });
      } else {
        throw new Error("No matching response found");
      }
    });
  };

  const EditAndOrAcceptComponent = () => {
    const editResponse = humanResponse.find((r) => r.type === "edit");
    if (
      !editResponse ||
      typeof editResponse.args !== "object" ||
      !editResponse.args
    ) {
      return null;
    }
    const header = editResponse.acceptAllowed ? "Edit/Accept" : "Edit";

    return (
      <div className="flex flex-col gap-2 items-start w-full p-6 rounded-lg border-[1px] border-gray-300">
        <div className="flex items-center justify-between w-full">
          <p className="font-semibold text-black text-base">{header}</p>
          <Button
            variant="ghost"
            className="flex items-center justify-center gap-2 text-gray-500"
          >
            <Undo2 className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>

        {Object.entries(editResponse.args.args).map(([k, v], idx) => {
          const value = ["string", "number"].includes(typeof v)
            ? v
            : JSON.stringify(v, null);
          // Calculate the default number of rows by the total length of the initial value divided by 30
          // or 8, whichever is greater. Stored in a ref to prevent re-rendering.
          if (
            defaultRows.current[k as keyof typeof defaultRows.current] ===
            undefined
          ) {
            defaultRows.current[k as keyof typeof defaultRows.current] =
              !v.length ? 3 : Math.max(v.length / 30, 7);
          }
          const numRows =
            defaultRows.current[k as keyof typeof defaultRows.current] || 8;

          return (
            <div
              className="flex flex-col gap-1 items-start w-full h-full px-[1px]"
              key={`allow-edit-args--${k}-${idx}`}
            >
              <div className="flex flex-col gap-[6px] items-start w-full">
                <p className="text-sm min-w-fit font-medium">
                  {prettifyText(k)}
                </p>
                <Textarea
                  disabled={streaming}
                  className="h-full"
                  value={value}
                  onChange={(e) => onEditChange(e, editResponse, k)}
                  rows={numRows}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const EditAndOrAccept = React.memo(EditAndOrAcceptComponent);

  const onResponseChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    response: HumanResponseWithEdits
  ) => {
    if (!e.target.value) {
      setHasAddedResponse(false);
      if (hasEdited) {
        // The user has deleted their response, so we should set the submit type to
        // `edit` if they've edited, or `accept` if it's allowed and they have not edited.
        setSelectedSubmitType("edit");
      } else if (acceptAllowed) {
        setSelectedSubmitType("accept");
      }
    } else {
      setSelectedSubmitType("response");
      setHasAddedResponse(true);
    }

    setHumanResponse((prev) => {
      const newResponse: HumanResponseWithEdits = {
        type: response.type,
        args: e.target.value,
      };

      if (prev.find((p) => p.type === response.type)) {
        return prev.map((p) => {
          if (p.type === response.type) {
            if (p.acceptAllowed) {
              return {
                ...newResponse,
                acceptAllowed: true,
                editsMade: !!e.target.value,
              };
            }
            return newResponse;
          }
          return p;
        });
      } else {
        throw new Error("No human response found for string response");
      }
    });
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-2",
        "shadow-sm"
      )}
    >
      {showArgsOutsideActionCards && (
        <div className="flex flex-col gap-6 items-start w-full">
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
                className="flex flex-col gap-1 items-start w-full"
              >
                <p className="text-sm leading-[18px] text-gray-600">
                  {prettifyText(k)}:
                </p>
                <span className="text-[13px] leading-[18px] text-black bg-zinc-100 rounded-xl p-3">
                  <MarkdownText>{value}</MarkdownText>
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-2 items-start w-full">
        <EditAndOrAccept />
        {supportsMultipleMethods ? (
          <div className="flex gap-3 items-center w-full mt-3">
            <Separator className="w-1/2" />
            <p className="text-sm text-gray-500">Or</p>
            <Separator className="w-1/2" />
          </div>
        ) : null}
        <Response
          humanResponse={humanResponse}
          streaming={streaming}
          showArgsInResponse={showArgsInResponse}
          interruptValue={interruptValue}
          onResponseChange={onResponseChange}
          handleSubmit={handleSubmit}
        />
        {streaming && !currentNode && (
          <p className="text-sm text-gray-600">Waiting for Graph to start...</p>
        )}
        {streaming && currentNode && !isError && (
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
        {streaming && currentNode && isError && (
          <div className="text-sm text-red-500 flex items-center justify-start gap-1">
            <p>Error occurred</p>
            <CircleX className="w-3 h-3 text-red-500" />
          </div>
        )}
        {streamFinished && (
          <p className="text-base text-green-600 font-medium">
            Successfully finished Graph invocation.
          </p>
        )}
      </div>
    </div>
  );
}
