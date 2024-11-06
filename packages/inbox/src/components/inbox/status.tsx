import { Badge } from "../ui/badge";

export function StatusBadge({ toolCallName }: { toolCallName: string }) {
  switch (toolCallName) {
    case "NewEmailDraft":
      return (
        <Badge className="bg-gray-500 hover:bg-gray-500">New Email Draft</Badge>
      );
    case "ResponseEmailDraft":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500">
          Response Email Draft
        </Badge>
      );
    case "Question":
      return <Badge className="bg-red-500 hover:bg-red-500">Question</Badge>;
    default:
      return null;
  }
}
