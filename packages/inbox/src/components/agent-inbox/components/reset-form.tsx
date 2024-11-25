import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CircleX } from "lucide-react";
import React from "react";

interface ResetFormProps {
  hasValues: boolean;
  handleResetForm: () => void;
}

export function ResetForm({ hasValues, handleResetForm }: ResetFormProps) {
  const [open, setOpen] = React.useState(false);

  const handleReset = () => {
    handleResetForm();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(c) => {
        if (c && hasValues) {
          setOpen(true);
        } else if (!c) {
          setOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <TooltipIconButton
          tooltip="Reset Form"
          delayDuration={250}
          onClick={() => {
            if (hasValues) {
              setOpen(true);
            }
          }}
          className={cn(
            "w-9 h-9",
            !hasValues && "cursor-default hover:bg-transparent"
          )}
        >
          <CircleX
            className={cn(
              "w-4 h-4",
              hasValues ? "cursor-pointer" : "cursor-default",
              hasValues ? "text-red-500 hover:text-red-600" : "text-gray-300"
            )}
          />
        </TooltipIconButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Reset</DialogTitle>
          <DialogDescription>
            Please confirm that you want to reset the form. All changes will be
            lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full">
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full"
          >
            Reset Form
          </Button>
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
