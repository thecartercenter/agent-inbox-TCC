import { BaseMessage } from "@langchain/core/messages";
import { Thread, ThreadStatus } from "@langchain/langgraph-sdk";

export interface HumanInterruptConfig {
  allow_ignore: boolean;
  allow_respond: boolean;
  allow_edit: boolean;
  allow_accept: boolean;
}

export interface ActionRequest {
  action: string;
  args: Record<string, any>;
}

export interface HumanInterrupt {
  action_request: ActionRequest;
  config: HumanInterruptConfig;
  description?: string;
}

export type HumanResponse = {
  type: "accept" | "ignore" | "response" | "edit";
  args: null | string | ActionRequest;
};

export type HumanResponseWithEdits = HumanResponse &
  (
    | { acceptAllowed?: false; editsMade?: never }
    | { acceptAllowed?: true; editsMade?: boolean }
  );

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

export interface ThreadValues {
  email: Email;
  messages: BaseMessage[];
  triage: {
    logic: string;
    response: string;
  };
}

// Enhanced ThreadStatus type that includes human_response_needed
export type EnhancedThreadStatus = ThreadStatus | "human_response_needed";

// Basic thread data interface with common properties
interface BaseThreadData<T extends Record<string, any> = Record<string, any>> {
  thread: Thread<T>;
  invalidSchema?: boolean;
}

// Generic thread data type for non-interrupted states
export interface GenericThreadData<
  T extends Record<string, any> = Record<string, any>,
> extends BaseThreadData<T> {
  status: "idle" | "busy" | "error";
  interrupts?: undefined;
}

// Interrupted thread data type
export interface InterruptedThreadData<
  T extends Record<string, any> = Record<string, any>,
> extends BaseThreadData<T> {
  status: "interrupted";
  interrupts?: HumanInterrupt[];
}

// Human response needed thread data type
export interface HumanResponseNeededThreadData<
  T extends Record<string, any> = Record<string, any>,
> extends BaseThreadData<T> {
  status: "human_response_needed";
  interrupts?: HumanInterrupt[];
}

// Union type for all thread data types
export type ThreadData<T extends Record<string, any> = Record<string, any>> =
  | GenericThreadData<T>
  | InterruptedThreadData<T>
  | HumanResponseNeededThreadData<T>;

export type ThreadStatusWithAll = EnhancedThreadStatus | "all";

export type SubmitType = "accept" | "response" | "edit";

export interface AgentInbox {
  /**
   * A unique identifier for the inbox.
   */
  id: string;
  /**
   * The ID of the graph.
   */
  graphId: string;
  /**
   * The URL of the deployment. Either a localhost URL, or a deployment URL.
   */
  deploymentUrl: string;
  /**
   * Optional name for the inbox, used in the UI to label the inbox.
   */
  name?: string;
  /**
   * Whether or not the inbox is selected.
   */
  selected: boolean;
}
