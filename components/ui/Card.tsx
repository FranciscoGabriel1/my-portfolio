import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "outline";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "glass",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        variant === "glass" && "glass",
        variant === "solid" && "bg-surface-elevated border border-border",
        variant === "outline" && "border border-border bg-transparent",
        hoverable &&
          "transition-transform duration-300 hover:scale-[1.02] hover:shadow-glow-primary cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pt-0 flex items-center gap-3", className)}
      {...props}
    />
  );
}
