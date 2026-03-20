import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-caption font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-surface-elevated px-4 py-2.5 text-body text-text-primary placeholder:text-text-muted",
            "transition-all duration-200 outline-none",
            "border-border hover:border-border-strong",
            "focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
            error && "border-accent-danger focus:border-accent-danger focus:ring-accent-danger/20",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-caption text-accent-danger" role="alert">
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={`${inputId}-helper`} className="text-caption text-text-muted">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
