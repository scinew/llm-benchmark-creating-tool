"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { RunStatusBadge } from "@/components/RunStatusBadge";
import { ResultsTable } from "@/components/ResultsTable";

interface RunDetailPageProps {
  params: Promise<{ id: string; runId: string }>;
}

interface RunSummary {
  totalModels: number;
  completedCount: number;
  failedCount: number;
  averageScore: number | null;
  minScore: number | null;
  maxScore: number | null;
}

interface Run {
  id: string;
  name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  summary: RunSummary;
  results: Array<{
    id: string;
    modelName: string;
    score: number;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  project: {
    id: string;
    name: string;
  };
}

// Hook to resolve params
function useResolvedParams(params: Promise<Record<string, string>>) {
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then(setResolved);
  }, [params]);

  return resolved;
}

export default function RunDetailPage({ params }: RunDetailPageProps) {
  const [run, setRun] = useState<Run | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = useResolvedParams(params);

  const fetchRun = useCallback(async () => {
    if (!resolvedParams.runId) return;

    try {
      const response = await fetch(`/api/runs/${resolvedParams.runId}`);
      if (!response.ok) {
        throw new Error("Failed to load run");
      }
      const data = await response.json();
      setRun(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load run");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.runId]);

  useEffect(() => {
    fetchRun();
  }, [fetchRun]);

  useEffect(() => {
    // Poll for status updates if still running
    if (!run || !resolvedParams.runId) return;

    const interval = setInterval(async () => {
      if (run.status === "PENDING" || run.status === "RUNNING") {
        try {
          const response = await fetch(`/api/runs/${resolvedParams.runId}`);
          if (response.ok) {
            const data = await response.json();
            setRun(data.data);
          }
        } catch {
          // Silently fail on poll
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [run?.status, resolvedParams.runId]);

  const downloadResults = (formatType: "json" | "csv") => {
    if (!run) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    if (formatType === "json") {
      content = JSON.stringify(run.results, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else {
      // CSV format
      const headers = ["Model", "Score", "Status", "Completed At"];
      const rows = run.results.map((r) => {
        const status =
          r.score > 0 ? "Success" : r.metadata?.error ? "Error" : "Pending";
        return [
          r.modelName,
          r.score > 0 ? r.score.toFixed(4) : "",
          status,
          r.createdAt
            ? format(new Date(r.createdAt), "yyyy-MM-dd HH:mm:ss")
            : "",
        ].join(",");
      });
      content = [headers.join(","), ...rows].join("\n");
      mimeType = "text/csv";
      extension = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.name.replace(/[^a-z0-9]/gi, "_")}_results.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-red-600 dark:text-red-400">
          {error || "Run not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${run.project.id}`}
            className="mb-4 flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Back to {run.project.name}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {run.name}
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-500">
                Created{" "}
                {format(new Date(run.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <RunStatusBadge status={run.status} />
          </div>
        </div>

        {/* Summary Stats */}
        {run.summary && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Total Models
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {run.summary.totalModels}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {run.summary.completedCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {run.summary.failedCount}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Avg Score
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {run.summary.averageScore !== null
                  ? run.summary.averageScore.toFixed(4)
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Results
          </h2>
          <ResultsTable results={run.results} onDownload={downloadResults} />
        </div>

        {/* Error Logs (if any) */}
        {run.results.some((r) => r.metadata?.error) && (
          <div className="mt-6 rounded-lg border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
              Error Logs
            </h2>
            <div className="space-y-3">
              {run.results
                .filter((r) => r.metadata?.error)
                .map((result) => (
                  <div
                    key={result.id}
                    className="rounded-md bg-red-50 p-3 dark:bg-red-900/20"
                  >
                    <p className="font-medium text-red-800 dark:text-red-300">
                      {result.modelName}
                    </p>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {String(result.metadata?.error)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Config Preview */}
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Configuration
          </h2>
          <pre className="overflow-x-auto text-sm text-zinc-600 dark:text-zinc-400">
            {JSON.stringify(run.config, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
