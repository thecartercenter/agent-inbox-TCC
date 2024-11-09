import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ToFromEmails({
  toEmailText,
  fromEmailText,
}: {
  toEmailText: string;
  fromEmailText: string;
}) {
  const shouldTruncateToEmails = toEmailText?.length > 35;
  const [showTruncatedToEmails, setShowTruncatedToEmails] = useState<boolean>();

  return (
    <div className="flex flex-col items-start justify-start gap-1 text-sm">
      <pre>{fromEmailText}</pre>
      <div className="flex flex-row items-start justify-start gap-1 w-full">
        <p className="text-gray-600">to</p>
        {shouldTruncateToEmails ? (
          <div className="flex items-start w-full justify-between">
            <pre
              className={cn(
                !showTruncatedToEmails ? "truncate ..." : "w-full text-pretty"
              )}
            >
              {toEmailText}
            </pre>
            <motion.div
              initial={false}
              animate={{ rotate: showTruncatedToEmails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipIconButton
                tooltip={showTruncatedToEmails ? "Show" : "Hide"}
                onClick={() => setShowTruncatedToEmails((s) => !s)}
                variant="ghost"
              >
                <ChevronDown className="text-gray-500 w-4 h-4" />
              </TooltipIconButton>
            </motion.div>
          </div>
        ) : (
          <pre>{toEmailText}</pre>
        )}
      </div>
    </div>
  );
}
