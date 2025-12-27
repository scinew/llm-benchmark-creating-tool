"use client";

import Link from "next/link";
import { format } from "date-fns";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  runCount: number;
  updatedAt: Date;
}

export function ProjectCard({
  id,
  name,
  description,
  runCount,
  updatedAt,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {runCount} runs
        </span>
      </div>
      {description && (
        <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Updated {format(new Date(updatedAt), "MMM d, yyyy")}
      </p>
    </Link>
  );
}
