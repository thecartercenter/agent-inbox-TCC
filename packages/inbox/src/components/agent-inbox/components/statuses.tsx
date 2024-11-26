import { HumanInterruptConfig } from "../types";
import { prettifyText } from "../utils";

export function InboxItemStatuses({
  config,
}: {
  config: HumanInterruptConfig;
}) {
  const allowedOps = Object.entries(config).flatMap(([k, v]) => {
    if (v) {
      return prettifyText(k).replace("Allow ", "");
    }
    return [];
  });

  const colorMap = {
    Ignore: {
      bg: "rgb(75 85 99)",
      shadow: "rgb(75 85 99, 0.6)",
    },
    Edit: {
      bg: "rgb(234 179 8)",
      shadow: "rgba(234 179 8, 0.6)",
    },
    Respond: {
      bg: "rgb(180 83 9)",
      shadow: "rgb(180 83 9, 0.6)",
    },
    Accept: {
      bg: "rgb(34 197 94)",
      shadow: "rgb(34 197 94, 0.6)",
    },
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-end w-full">
      {allowedOps.map((op, idx) => (
        <div
          key={`allowed-op-${idx}`}
          className="flex items-center gap-1 rounded-lg border-[1px] border-gray-200 px-2 py-1 min-w-fit"
        >
          <div
            className="w-2 h-2 rounded-full animate-[glow_2s_ease-in-out_infinite]"
            style={{
              background: colorMap[op as keyof typeof colorMap].bg,
              boxShadow: colorMap[op as keyof typeof colorMap].shadow,
            }}
          />
          <p className="text-gray-500 text-xs">{op}</p>
        </div>
      ))}
    </div>
  );
}

export function ThreadStatusBadge({
  status,
}: {
  status: "idle" | "busy" | "error" | "interrupted";
}) {
  const colorMap = {
    idle: {
      bg: "rgb(75 85 99)",
      shadow: "rgb(75 85 99, 0.6)",
    },
    busy: {
      bg: "rgb(234 179 8)",
      shadow: "rgba(234 179 8, 0.6)",
    },
    error: {
      bg: "rgb(180 83 9)",
      shadow: "rgb(180 83 9, 0.6)",
    },
    interrupted: {
      bg: "rgb(180, 250, 237)",
      shadow: "rgb(180, 250, 237, 0.6)",
    },
  };
  const statusColor = colorMap[status];

  return (
    <div className="flex items-center justify-end  gap-1 rounded-lg border-[1px] border-gray-200 px-2 py-1 min-w-fit">
      <div
        className="w-2 h-2 rounded-full animate-[glow_2s_ease-in-out_infinite]"
        style={{
          background: statusColor.bg,
          boxShadow: statusColor.shadow,
        }}
      />
      <p className="text-gray-500 text-xs">{prettifyText(status)}</p>
    </div>
  );
}
