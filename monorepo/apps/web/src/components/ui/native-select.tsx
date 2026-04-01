// Component module: native-select
// Purpose: Shared UI/business logic used across multiple pages.

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react";

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                {icon}
            </div>
        )}
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD6B20] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-slate-300 transition-all text-slate-900",
            icon ? "pl-10" : "",
            className
          )}
          ref={ref}
          {...props}
        >
            {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }


