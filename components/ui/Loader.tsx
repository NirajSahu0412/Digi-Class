"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "indigo" | "white" | "dark";
}

export function Loader({ className, size = "md", variant = "indigo" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  };

  const variantClasses = {
    indigo: "text-indigo-600",
    white: "text-white",
    dark: "text-gray-900",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative">
        <Loader2
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )}
          strokeWidth={1.5}
        />
        <div className={cn(
          "absolute inset-0 flex items-center justify-center opacity-20",
          variantClasses[variant]
        )}>
          <div className={cn(
            "rounded-full bg-current",
            size === "xl" ? "w-2 h-2" : "w-1 h-1"
          )} />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-[#050511]/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in">
      <div className="relative flex flex-col items-center gap-6">
        {/* Modern glowing effect */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />

        <div className="relative bg-white/40 dark:bg-white/5 p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 flex flex-col items-center backdrop-blur-2xl">
          <Loader size="xl" />
          <div className="mt-6 flex flex-col items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Preparing your classroom
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
              Syncing documents and sessions...
            </p>
          </div>
        </div>

        {/* Progress indicator decoration */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
