import { Copy, CopyCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
          <ThreadIdCopyable
            threadIdClassName="bg-transparent"
            threadId={threadId}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ThreadIdCopyable({
  threadId,
  threadIdClassName,
}: {
  threadId: string;
  threadIdClassName?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(threadId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-1 items-center">
      <p
        className={cn(
          "font-mono flex items-center gap-1", // Keep font-mono as base style
          !threadIdClassName &&
            "bg-gray-50/90 text-xs px-1 py-[2px] rounded-md border-[1px] border-gray-200", // Apply default styles only if no custom class
          threadIdClassName // Apply custom classes last to allow overrides
        )}
      >
        {threadId}
        <TooltipIconButton
          onClick={(e) => handleCopy(e)}
          variant="ghost"
          tooltip="Copy thread ID"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <CopyCheck className="w-3 h-3 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Copy className="w-3 h-3 text-gray-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipIconButton>
      </p>
    </div>
  );
}
