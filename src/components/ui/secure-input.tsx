
import * as React from "react";
import { cn } from "@/lib/utils";
import { securityUtils } from "@/utils/securityUtils";

export interface SecureInputProps extends React.ComponentProps<"input"> {
  maxLength?: number;
  sanitize?: boolean;
  validationRules?: Array<(value: string) => string | null>;
  securityLevel?: 'basic' | 'enhanced';
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    className, 
    type, 
    maxLength = 255, 
    sanitize = true, 
    validationRules = [], 
    securityLevel = 'enhanced',
    onChange, 
    ...props 
  }, ref) => {
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Apply length validation first
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Apply sanitization based on security level
      if (sanitize) {
        if (securityLevel === 'enhanced') {
          value = securityUtils.sanitizeUserContent(value);
        } else {
          // Basic sanitization - remove potential XSS patterns
          value = value.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
        }
      }
      
      // Enhanced security checks for certain input types
      if (securityLevel === 'enhanced') {
        if (type === 'email') {
          const emailValidation = securityUtils.validateSecureEmail(value);
          if (value && !emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email format');
          } else {
            setError(null);
          }
        } else if (props.name === 'name' || props.name === 'full_name') {
          const nameValidation = securityUtils.validateBabyName(value);
          if (value && !nameValidation.isValid) {
            setError(nameValidation.error || 'Invalid name format');
          } else {
            setError(null);
          }
        }
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
      
      if (validationError) {
        setError(validationError);
      } else if (!error) {
        setError(null);
      }
      
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
          maxLength={maxLength}
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
