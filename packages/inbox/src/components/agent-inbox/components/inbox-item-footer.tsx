import React, { useEffect } from "react";
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
import { SubmitType } from "../types";
import { ResetForm } from "./reset-form";

interface SubmitSelectProps {
  loading: boolean;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  selectedSubmitType: SubmitType;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  acceptAllowed: boolean;
}

function SubmitSelect({
  loading,
  handleSubmit,
  selectedSubmitType,
  setSelectedSubmitType,
  hasEdited,
  hasAddedResponse,
  acceptAllowed,
}: SubmitSelectProps) {
  const [submitMessage, setSubmitMessage] = React.useState<string>("Submit");
  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(true);

  useEffect(() => {
    if (selectedSubmitType === "accept") {
      setSubmitMessage("Accept");
    } else if (selectedSubmitType === "response") {
      setSubmitMessage("Send Response");
    } else if (selectedSubmitType === "edit") {
      setSubmitMessage("Submit Edit");
    }
  }, [selectedSubmitType]);

  useEffect(() => {
    if (selectedSubmitType === "accept") {
      setSubmitDisabled(false);
    } else if (selectedSubmitType === "response") {
      if (hasAddedResponse) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    } else if (selectedSubmitType === "edit") {
      if (hasEdited) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    }
  }, [selectedSubmitType, hasEdited, hasAddedResponse]);

  // If the user has not edited or added a response, they can't toggle between the two so
  // just return a single button. This button is also disabled in this state if the submit
  // type is not "accept".
  if (!hasEdited && !hasAddedResponse) {
    if (selectedSubmitType === "accept") {
      return (
        <Button variant="default" disabled={loading} onClick={handleSubmit}>
          Accept
        </Button>
      );
    }

    return (
      <Button variant="default" disabled={true} onClick={handleSubmit}>
        {submitMessage}
      </Button>
    );
  }

  return (
    <div className="flex flex-row items-center">
      <Button
        variant="default"
        disabled={loading || submitDisabled}
        onClick={handleSubmit}
        className="rounded-r-none border-none focus:ring-0 focus-visible:ring-0"
      >
        {submitMessage}
      </Button>
      <Select
        disabled={loading}
        value={selectedSubmitType}
        onValueChange={(v) => setSelectedSubmitType(v as SubmitType)}
      >
        <SelectTrigger className="rounded-l-none bg-primary text-primary-foreground shadow hover:bg-primary/90 border-none focus:ring-0 focus-visible:ring-0" />
        <SelectContent>
          <SelectGroup>
            {acceptAllowed && !hasEdited && (
              <SelectItem value="accept">Accept</SelectItem>
            )}
            {hasEdited && <SelectItem value="edit">Send Edit</SelectItem>}
            {hasAddedResponse && (
              <SelectItem value="response">Send Response</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

interface InboxItemFooterProps {
  handleResetForm: () => void;
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
  streaming: boolean;
  streamFinished: boolean;
  currentNode: string;
  loading: boolean;
  threadId: string;
  isIgnoreAllowed: boolean;
  supportsMultipleMethods: boolean;

  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  selectedSubmitType: SubmitType | undefined;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  acceptAllowed: boolean;
}

export function InboxItemFooter({
  streaming,
  streamFinished,
  currentNode,
  loading,
  threadId,
  isIgnoreAllowed,
  handleResetForm,
  handleResolve,
  handleSubmit,
  handleIgnore,
  setActive,
  handleToggleViewState,
  setSelectedSubmitType,
  selectedSubmitType,
  hasEdited,
  hasAddedResponse,
  acceptAllowed,
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
            <ResetForm
              hasValues={hasEdited || hasAddedResponse}
              handleResetForm={handleResetForm}
            />
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
            {selectedSubmitType && (
              <SubmitSelect
                loading={loading}
                handleSubmit={handleSubmit}
                selectedSubmitType={selectedSubmitType}
                setSelectedSubmitType={setSelectedSubmitType}
                hasEdited={hasEdited}
                hasAddedResponse={hasAddedResponse}
                acceptAllowed={acceptAllowed}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
