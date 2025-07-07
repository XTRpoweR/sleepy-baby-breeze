
import * as React from "react";
import { cn } from "@/lib/utils";
import { validateInput } from "@/utils/validation";

export interface SecureTextareaProps extends React.ComponentProps<"textarea"> {
  maxLength?: number;
  sanitize?: boolean;
}

const SecureTextarea = React.forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ className, maxLength = 1000, sanitize = true, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      
      // Apply length validation
      if (maxLength && !validateInput.maxLength(value, maxLength)) {
        value = value.substring(0, maxLength);
      }
      
      // Apply sanitization if enabled
      if (sanitize) {
        value = validateInput.sanitizeHtml(value);
      }
      
      setCharCount(value.length);
      
      // Update the event target value
      e.target.value = value;
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {maxLength && (
          <div className="flex justify-end mt-1">
            <span className={cn(
              "text-xs text-gray-500",
              charCount > maxLength * 0.9 && "text-orange-500",
              charCount >= maxLength && "text-red-500"
            )}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);
SecureTextarea.displayName = "SecureTextarea";

export { SecureTextarea };
