export type Email = {
  id: string;
  thread_id: string;
  from_email: string;
  to_email: string;
  subject: string;
  page_content: string;
  send_time: string | undefined;
  read: boolean;
  status: "in-queue" | "processing" | "hitl" | "done";
};

export type InboxType = "all" | "hitl" | "read" | "unread" | "running";
