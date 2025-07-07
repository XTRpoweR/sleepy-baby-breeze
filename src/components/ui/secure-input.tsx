
import * as React from "react";
import { cn } from "@/lib/utils";
import { validateInput } from "@/utils/validation";

export interface SecureInputProps extends React.ComponentProps<"input"> {
  maxLength?: number;
  sanitize?: boolean;
  validationRules?: Array<(value: string) => string | null>;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, type, maxLength = 255, sanitize = false, validationRules = [], onChange, ...props }, ref) => {
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Apply length validation
      if (maxLength && !validateInput.maxLength(value, maxLength)) {
        value = value.substring(0, maxLength);
      }
      
      // Apply sanitization if enabled
      if (sanitize) {
        value = validateInput.sanitizeHtml(value);
      }
      
      // Apply custom validation rules
      let validationError: string | null = null;
      for (const rule of validationRules) {
        const ruleError = rule(value);
        if (ruleError) {
          validationError = ruleError;
          break;
        }
      }
      
      setError(validationError);
      
      // Update the event target value
      e.target.value = value;
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);
SecureInput.displayName = "SecureInput";

export { SecureInput };
