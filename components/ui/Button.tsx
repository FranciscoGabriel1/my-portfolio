import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

/** Estilos de botão; também usados em links com cara de botão (`<a className={buttonVariants()}>`). */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold select-none",
    "transition-[transform,background-color,border-color,color] duration-200 ease-out",
    "motion-safe:hover:-translate-y-0.5",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent/90",
        secondary: "border border-line-strong bg-transparent text-text hover:bg-surface",
        ghost: "text-text-2 hover:bg-surface hover:text-text",
        outline: "border border-line-strong bg-transparent text-text hover:bg-surface",
        danger: "bg-accent-danger text-bg hover:opacity-90",
      },
      size: {
        sm: "min-h-10 px-4 text-[0.92rem]",
        md: "min-h-12 px-5 text-base",
        lg: "min-h-12 px-6 text-base",
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
