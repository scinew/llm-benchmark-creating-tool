"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RunForm } from "@/components/RunForm";

interface NewRunPageProps {
  params: Promise<{ id: string }>;
}

interface Project {
  id: string;
  name: string;
  config: Record<string, unknown> | null;
}

export default function NewRunPage({ params }: NewRunPageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableModels] = useState([
    "gpt-4o",
    "gpt-4o-mini",
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250514",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "deepseek-v3",
    "mistral-large",
  ]);

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(`/api/projects/${(await params).id}`);
        if (!response.ok) {
          throw new Error("Failed to load project");
        }
        const data = await response.json();
        setProject(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [params]);

  const handleRunCreated = () => {
    router.push(`/projects/${project?.id}`);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-red-600 dark:text-red-400">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/projects/${project.id}`}
          className="mb-6 flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to Project
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Create New Run
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Configure and run a benchmark for project:{" "}
          <strong>{project.name}</strong>
        </p>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <RunForm
            projectId={project.id}
            availableModels={availableModels}
            initialConfig={project.config || undefined}
            onRunCreated={handleRunCreated}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
            Before you begin
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>Select the models you want to benchmark</li>
            <li>
              The benchmark will run each test case against all selected models
            </li>
            <li>Results will be available once the run completes</li>
            <li>
              Note: Actual LLM API calls will be implemented in a separate task
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
