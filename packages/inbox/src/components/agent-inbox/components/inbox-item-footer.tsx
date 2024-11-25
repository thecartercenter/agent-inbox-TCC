import React from "react";
import { Button } from "../../ui/button";
import { prettifyText } from "../utils";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";
import { useQueryParams } from "../hooks/use-query-params";
import { LoaderCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface SubmitSelectProps {
  loading: boolean;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  setSubmitType: React.Dispatch<React.SetStateAction<"edit" | "respond">>;
  submitType: "edit" | "respond";
}

function SubmitSelect({
  loading,
  handleSubmit,
  submitType,
  setSubmitType,
}: SubmitSelectProps) {
  const submitMessage = submitType === "edit" ? "Submit Edit" : "Send Respond";
  return (
    <div className="flex flex-row items-center">
      <Button
        variant="default"
        disabled={loading}
        onClick={handleSubmit}
        className="rounded-r-none"
      >
        {submitMessage}
      </Button>
      <Select
        disabled={loading}
        onValueChange={(v) => setSubmitType(v as "edit" | "respond")}
      >
        <SelectTrigger className="rounded-l-none bg-primary text-primary-foreground shadow hover:bg-primary/90 border-none focus:ring-0 focus-visible:ring-0" />
        <SelectContent>
          <SelectGroup>
            <SelectItem value="edit">Send Edit</SelectItem>
            <SelectItem value="respond">Send Response</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

interface InboxItemFooterProps {
  handleToggleViewState: () => void;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  handleIgnore: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  handleResolve: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  setSubmitType: React.Dispatch<React.SetStateAction<"edit" | "respond">>;
  submitType: "edit" | "respond";
  streaming: boolean;
  streamFinished: boolean;
  currentNode: string;
  loading: boolean;
  threadId: string;
  isIgnoreAllowed: boolean;
  supportsMultipleMethods: boolean;
}

export function InboxItemFooter({
  streaming,
  streamFinished,
  currentNode,
  loading,
  threadId,
  isIgnoreAllowed,
  handleResolve,
  handleSubmit,
  handleIgnore,
  setActive,
  handleToggleViewState,
  submitType,
  setSubmitType,
  supportsMultipleMethods,
}: InboxItemFooterProps) {
  const { getSearchParam, updateQueryParams } = useQueryParams();

  return (
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
          <p className="text-sm text-gray-600">Waiting for Graph to start...</p>
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
                const currQueryParamThreadId = getSearchParam(
                  VIEW_STATE_THREAD_QUERY_PARAM
                );
                if (currQueryParamThreadId === threadId) {
                  updateQueryParams(VIEW_STATE_THREAD_QUERY_PARAM);
                }
                setActive(false);
              }}
            >
              Close
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={handleResolve}
              className="border-red-800 text-red-800 hover:text-red-900"
            >
              Mark Resolved
            </Button>
            {isIgnoreAllowed && (
              <Button
                variant="outline"
                disabled={loading}
                onClick={handleIgnore}
                className="border-red-500 text-red-500 hover:text-red-600"
              >
                Ignore
              </Button>
            )}
            {supportsMultipleMethods ? (
              <SubmitSelect
                loading={loading}
                handleSubmit={handleSubmit}
                submitType={submitType}
                setSubmitType={setSubmitType}
              />
            ) : (
              <Button
                variant="default"
                disabled={loading}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
