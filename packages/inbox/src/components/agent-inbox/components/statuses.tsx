import { cn } from "@/lib/utils";
import { HumanInterruptConfig } from "../types";
import { prettifyText } from "../utils";

export function InboxItemStatuses({
  config,
  status,
}: {
  config?: HumanInterruptConfig;
  status?: "idle" | "busy" | "error" | "interrupted";
}) {
  if (!config && !status) {
    throw new Error("Either config or status must be provided");
  }
  if (config && status) {
    throw new Error("Only one of config or status can be provided");
  }

  if (config) {
    const isOnlyIgnoreAllowed =
      config.allow_ignore &&
      !config.allow_respond &&
      !config.allow_edit &&
      !config.allow_accept;

    return (
      <div
        className={cn(
          "flex items-center justify-center px-2 py-[2px] rounded-full border-[2px] w-fit font-medium text-nowrap",
          isOnlyIgnoreAllowed
            ? "border-gray-600 text-gray-600"
            : "border-green-700 text-green-700"
        )}
      >
        <p className="text-sm">
          {isOnlyIgnoreAllowed ? "Ignore" : "Requires Action"}
        </p>
      </div>
    );
  } else if (status) {
    return (
      <div
        className={cn(
          "flex items-center justify-center px-2 py-[2px] rounded-full border-[2px] w-fit font-medium text-nowrap",
          status === "idle" && "border-gray-600 text-gray-600",
          status === "busy" && "border-yellow-600 text-yellow-600",
          status === "error" && "border-red-600 text-red-600",
          status === "interrupted" && "border-green-700 text-green-700"
        )}
      >
        <p className="text-sm">{prettifyText(status)}</p>
      </div>
    );
  }

  return null;
}
