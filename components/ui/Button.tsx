"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      secondary: "bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20",
      outline: "bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50",
      ghost: "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-md",
      md: "h-11 px-6 text-sm rounded-xl font-medium",
      lg: "h-13 px-8 text-base rounded-2xl font-semibold",
      icon: "h-10 w-10 rounded-xl flex items-center justify-center p-0",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin absolute" />
        )}
        
        <span className={cn("flex items-center gap-2 transition-opacity", isLoading ? "opacity-0" : "opacity-100")}>
          {leftIcon && !isLoading && <span>{leftIcon}</span>}
          {children}
          {rightIcon && !isLoading && <span>{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
