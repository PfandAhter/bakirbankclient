import * as React from "react"
import { cn } from "@/src/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
}

function Input({ className, type, icon, error, ...props }: InputProps) {
    return (
        <div className="relative w-full flex items-center">
            {icon && (
                <div className="absolute left-3 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                data-slot="input"
                className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    // Conditional focus styles based on error state
                    error
                        ? "focus-visible:border-red-500 focus-visible:ring-red-500/50 focus-visible:ring-[3px]"
                        : "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    // Also add a red border when there's an error (even without focus)
                    error && "border-red-500 focus:ring-red-500",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    "text-white",
                    icon ? "pl-10" : "pl-3",
                    className
                )}
                {...props}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )
}

export { Input }