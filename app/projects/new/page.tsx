import Link from "next/link";
import { ProjectForm } from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <Link
            href="/projects"
            className="mb-4 flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Create New Project
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Set up a new benchmark project
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ProjectForm />
        </div>
      </main>
    </div>
  );
}
