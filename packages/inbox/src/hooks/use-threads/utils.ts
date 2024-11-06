import { Email } from "@/components/inbox/types";
import { Thread } from "@langchain/langgraph-sdk";

const convertThreadsToTableData = (
  threads: Thread<Record<string, any>>[]
): Email[] => {
  throw new Error("Not implemented");
};
