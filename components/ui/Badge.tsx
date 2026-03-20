import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-elevated text-text-secondary border border-border",
        primary: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
        secondary: "bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20",
        success: "bg-accent-success/10 text-accent-success border border-accent-success/20",
        warning: "bg-accent-warning/10 text-accent-warning border border-accent-warning/20",
        danger: "bg-accent-danger/10 text-accent-danger border border-accent-danger/20",
        outline: "border border-border text-text-secondary bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.7rem]",
        md: "px-2.5 py-1 text-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
