import { Dispatch, SetStateAction } from "react";
import { InboxType } from "./types";
import { Button } from "../ui/button";

interface InboxListProps {
  selectedInbox: InboxType;
  setSelectedInbox: Dispatch<SetStateAction<InboxType>>;
}

export function InboxList(props: InboxListProps) {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-0">
      <Button
        onClick={() => props.setSelectedInbox("hitl")}
        variant={props.selectedInbox === "hitl" ? "default" : "outline"}
        className="w-[180px] h-10 rounded-b-none items-center justify-start"
      >
        Human in the Loop
      </Button>
      <Button
        onClick={() => props.setSelectedInbox("all")}
        variant={props.selectedInbox === "all" ? "default" : "outline"}
        className="w-[180px] h-10 rounded-b-none items-center justify-start"
      >
        All
      </Button>
      <Button
        onClick={() => props.setSelectedInbox("read")}
        variant={props.selectedInbox === "read" ? "default" : "outline"}
        className="w-[180px] h-10 rounded-none border-t-0 items-center justify-start"
      >
        Read
      </Button>
      <Button
        onClick={() => props.setSelectedInbox("unread")}
        variant={props.selectedInbox === "unread" ? "default" : "outline"}
        className="w-[180px] h-10 rounded-none border-t-0 items-center justify-start"
      >
        Unread
      </Button>
      <Button
        onClick={() => props.setSelectedInbox("running")}
        variant={props.selectedInbox === "running" ? "default" : "outline"}
        className="w-[180px] h-10 rounded-t-none border-t-0 items-center justify-start"
      >
        Running
      </Button>
    </div>
  );
}
