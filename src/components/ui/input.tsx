import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, dir, lang, ...props }, ref) => {
    // Force LTR + English locale on native date/time pickers so the
    // placeholder/format does not flip to RTL / Arabic numerals,
    // while keeping the rest of the UI in the user's language.
    const isDateTime =
      type === "date" ||
      type === "time" ||
      type === "datetime-local" ||
      type === "month" ||
      type === "week";

    return (
      <input
        type={type}
        dir={dir ?? (isDateTime ? "ltr" : undefined)}
        lang={lang ?? (isDateTime ? "en" : undefined)}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isDateTime && "text-left [&::-webkit-datetime-edit]:text-left",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
