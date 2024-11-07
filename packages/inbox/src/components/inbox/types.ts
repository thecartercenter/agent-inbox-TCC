import { BaseMessage } from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import { Thread } from "@langchain/langgraph-sdk";

export type Email = {
  id: string;
  thread_id: string;
  from_email: string;
  to_email: string;
  subject: string;
  page_content: string;
  send_time: string | undefined;
  read?: boolean;
  status?: "in-queue" | "processing" | "hitl" | "done";
};

export type InboxType = "all" | "hitl" | "read" | "unread" | "running";

export interface ThreadValues {
  email: Email;
  messages: BaseMessage[];
  triage: {
    logic: string;
    response: string;
  };
}

export enum ActionType {
  EDIT = "EDIT",
  ADD = "ADD",
  NOTIFY = "NOTIFY",
}

/** Base interface for all human loop events */
export interface BaseHumanLoopEvent {
  type: ActionType;
  /**
   * The message to display to the human.
   * Should be a plain text message which conveys
   * the action to be taken.
   */
  message: string;
  /**
   * Optional metadata to be passed along with the event.
   * E.g.: a tool call object.
   */
  metadata?: Record<string, any>;
  /**
   * Tool call generated before the HITL event, to be used
   * for adding/editing events.
   */
  tool_call?: ToolCall;
}

/** Event for editing existing values */
export interface EditEvent extends BaseHumanLoopEvent {
  type: ActionType.EDIT;
  /** The key of the field to be edited. */
  target_field: string;
  /** The ID of the message being edited */
  message_id: string;
  /**
   * Tool call generated before the HITL event, to be used
   * for adding/editing events.
   */
  tool_call?: ToolCall;
}

/** Event for adding new values */
export interface AddEvent extends BaseHumanLoopEvent {
  type: ActionType.ADD;
  /**
   * The type of message to add
   * For 'tool', the message should be a tool result message
   * For 'human', the message should be a human message
   */
  message_type: "tool" | "human";
}

/** Event for notifications */
export interface NotifyEvent extends BaseHumanLoopEvent {
  type: ActionType.NOTIFY;
}

/** Union type for all possible events */
export type HumanLoopEvent = EditEvent | AddEvent | NotifyEvent;

export interface ThreadInterruptData {
  thread_id: string;
  interrupt_value?: HumanLoopEvent;
  next: string[];
  thread: Thread<ThreadValues>;
}
