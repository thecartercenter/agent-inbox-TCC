import React from "react";
import { Button, ButtonProps, buttonVariants } from "./button";
import { cn } from "@/lib/utils";

const PillButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        className={cn(className, "rounded-full px-3 py-1")}
        ref={ref}
        {...props}
      />
    );
  }
);

export { PillButton };
