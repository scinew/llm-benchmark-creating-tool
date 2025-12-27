"use client";

import { useState } from "react";
import { format } from "date-fns";

interface Result {
  id: string;
  modelName: string;
  score: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ResultsTableProps {
  results: Result[];
  onDownload?: (format: "json" | "csv") => void;
}

function SortIcon({
  isActive,
  direction,
}: {
  isActive: boolean;
  direction: "asc" | "desc" | null;
}) {
  if (!isActive) {
    return (
      <span className="ml-1 inline-block w-4 text-zinc-300 dark:text-zinc-700">
        ↕
      </span>
    );
  }
  return (
    <span className="ml-1 inline-block w-4">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function ResultsTable({ results, onDownload }: ResultsTableProps) {
  const [sortField, setSortField] = useState<keyof Result>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Result) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="space-y-4">
      {onDownload && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onDownload("json")}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Download JSON
          </button>
          <button
            onClick={() => onDownload("csv")}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Download CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-left font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("modelName")}
              >
                Model{" "}
                <SortIcon
                  isActive={sortField === "modelName"}
                  direction={sortField === "modelName" ? sortDirection : null}
                />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("score")}
              >
                Score{" "}
                <SortIcon
                  isActive={sortField === "score"}
                  direction={sortField === "score" ? sortDirection : null}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("createdAt")}
              >
                Completed{" "}
                <SortIcon
                  isActive={sortField === "createdAt"}
                  direction={sortField === "createdAt" ? sortDirection : null}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {sortedResults.map((result) => {
              const hasError = result.metadata?.error;
              return (
                <tr
                  key={result.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {result.modelName}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-900 dark:text-zinc-100">
                    {result.score > 0 ? result.score.toFixed(4) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {hasError ? (
                      <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Error
                      </span>
                    ) : result.score > 0 ? (
                      <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {result.createdAt
                      ? format(new Date(result.createdAt), "MMM d, HH:mm")
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {sortedResults.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No results yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
