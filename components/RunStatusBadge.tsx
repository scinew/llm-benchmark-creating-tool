"use client";

import { cn } from "@/lib/utils";

interface RunStatusBadgeProps {
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  size?: "sm" | "md";
}

const statusConfig = {
  PENDING: {
    label: "Queued",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    textColor: "text-zinc-600 dark:text-zinc-400",
    dotColor: "bg-zinc-400",
  },
  RUNNING: {
    label: "Running",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    dotColor: "bg-blue-500 animate-pulse",
  },
  COMPLETED: {
    label: "Completed",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  FAILED: {
    label: "Failed",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

export function RunStatusBadge({ status, size = "md" }: RunStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses =
    size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgColor,
        config.textColor,
        sizeClasses
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
