import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThreadIdTooltip({ threadId }: { threadId: string }) {
  const firstThreeChars = threadId.slice(0, 3);
  const lastThreeChars = threadId.slice(-3);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <p className="font-mono tracking-tighter text-[10px] leading-[12px] px-1 py-[2px] bg-gray-100 rounded-md">
            {firstThreeChars}...{lastThreeChars}
          </p>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono">{threadId}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
