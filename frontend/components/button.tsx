"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

export const buttonVariants = tv({
  base: "cursor-pointer inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 focus:ring-offset-midnight disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    variant: {
      primary: "bg-emerald text-white hover:bg-[#1a5d42] active:bg-[#155036]",
      secondary: "bg-transparent text-white border border-border hover:border-emerald/30 hover:bg-emerald/5",
    },
    size: {
      default: "px-8 py-3 text-base h-12",
      lg: "px-10 py-4 text-lg h-14",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
