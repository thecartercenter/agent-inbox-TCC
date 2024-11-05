import { Email } from "./types";
import { Badge } from "../ui/badge";

export function StatusBadge({ status }: { status: Email["status"] }) {
  switch (status) {
    case "in-queue":
      return <Badge className="bg-gray-500 hover:bg-gray-500">In Queue</Badge>;
    case "processing":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500">Processing</Badge>
      );
    case "hitl":
      return (
        <Badge className="bg-red-500 hover:bg-red-500">Human in the Loop</Badge>
      );
    case "done":
      return <Badge className="bg-green-500 hover:bg-green-500">Done</Badge>;
  }
}
