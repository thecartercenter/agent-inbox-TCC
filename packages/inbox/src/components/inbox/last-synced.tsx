import { CircleCheck, LoaderCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { differenceInMinutes, differenceInHours, format } from "date-fns";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";

interface LastSyncedProps {
  fetchData: () => Promise<void>;
  loading: boolean;
}

function formatLastSynced(date: Date): string {
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, date);
  const hoursDiff = differenceInHours(now, date);

  if (minutesDiff < 1) {
    return "just now";
  } else if (minutesDiff === 1) {
    return "1 minute ago";
  } else if (minutesDiff < 60) {
    return `${minutesDiff} minutes ago`;
  } else if (hoursDiff < 24) {
    return `${Math.floor(hoursDiff)} hours ago`;
  } else {
    return format(date, "MM/dd/yyyy HH:mm");
  }
}

export function LastSynced({ fetchData, loading }: LastSyncedProps) {
  const [lastSynced, setLastSynced] = useState<Date>();

  const sync = async () => {
    await fetchData();
    setLastSynced(new Date());
    window.localStorage.setItem(
      "agent_inbox_last_synced",
      new Date().toISOString()
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!lastSynced) {
      const lastSyncedString = window.localStorage.getItem(
        "agent_inbox_last_synced"
      );
      if (lastSyncedString) {
        try {
          setLastSynced(new Date(lastSyncedString));
        } catch (e) {
          console.error("Error parsing last synced date", e);
        }
      } else {
        sync();
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-end gap-4 w-full">
      {loading ? (
        <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <p>Syncing</p>
          <LoaderCircle className="w-4 h-4 animate-spin" />
        </span>
      ) : lastSynced ? (
        <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <p>Last synced {lastSynced && formatLastSynced(lastSynced)}</p>
          <CircleCheck className="w-3 h-3 text-green-500" />
        </span>
      ) : null}
      {!loading && <p className="text-sm text-gray-300 ml-1">|</p>}
      {!loading && (
        <TooltipIconButton tooltip="Refresh" onClick={sync} variant="ghost">
          <RefreshCcw className="w-3 h-3 text-gray-500" />
        </TooltipIconButton>
      )}
    </div>
  );
}
