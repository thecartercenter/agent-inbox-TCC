import * as React from "react";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isSearch?: boolean; // Add this new prop
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isSearch, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            isSearch && "pr-8", // Add padding-right when search icon is present
            className
          )}
          ref={ref}
          {...props}
        />
        {isSearch && (
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
