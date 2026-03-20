import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-primary text-white hover:bg-accent-primary-hover active:scale-[0.98] shadow-sm hover:shadow-glow-primary",
        secondary:
          "bg-surface-elevated border border-border text-text-primary hover:bg-surface hover:border-border-strong active:scale-[0.98]",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:scale-[0.98]",
        danger:
          "bg-accent-danger text-white hover:opacity-90 active:scale-[0.98]",
        outline:
          "border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-caption",
        md: "h-10 px-5 text-body",
        lg: "h-12 px-7 text-body-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
