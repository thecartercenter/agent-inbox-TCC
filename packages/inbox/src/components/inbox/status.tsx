import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "../ui/badge";
import { ActionType } from "./types";

export function StatusBadge({
  type,
  className,
  ...badgeProps
}: { type: ActionType } & BadgeProps) {
  switch (type) {
    case "EDIT":
      return (
        <Badge
          {...badgeProps}
          className={cn(className, "bg-gray-500 hover:bg-gray-500")}
        >
          Edit/Confirm
        </Badge>
      );
    case "ADD":
      return (
        <Badge
          {...badgeProps}
          className={cn(className, "bg-blue-500 hover:bg-blue-500")}
        >
          Input Required
        </Badge>
      );
    case "NOTIFY":
      return (
        <Badge
          {...badgeProps}
          className={cn(className, "bg-red-500 hover:bg-red-500")}
        >
          Notify
        </Badge>
      );
    default:
      return null;
  }
}
