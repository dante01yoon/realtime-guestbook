"use client";

import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-400 disabled:bg-slate-400",
  secondary:
    "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 focus-visible:ring-slate-300",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
