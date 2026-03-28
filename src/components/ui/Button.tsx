"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 select-none";
    const variants: Record<string, string> = {
      primary: "bg-[#6C5CE7] text-white hover:bg-[#5a4dd4] shadow-sm active:scale-[0.98]",
      outline:
        "border border-[#e5e7eb] bg-transparent text-[#0a0a0b] hover:bg-[#f3f4f6] active:scale-[0.98]",
      ghost: "bg-transparent text-[#0a0a0b] hover:bg-[#f3f4f6]",
    };
    const sizes: Record<string, string> = {
      sm: "text-sm px-4 h-9",
      md: "text-sm px-5 h-10",
      lg: "text-base px-7 h-12",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant ?? "primary"]} ${sizes[size ?? "md"]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
