import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RunStatusBadge } from "@/components/RunStatusBadge";
import { format } from "date-fns";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      benchmarkRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: {
            select: { results: true },
          },
        },
      },
      _count: {
        select: { benchmarkRuns: true },
      },
    },
  });

  return project;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="mb-4 flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Back to Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
              )}
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                Created {format(new Date(project.createdAt), "MMM d, yyyy")} •{" "}
                {project._count.benchmarkRuns} runs
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/projects/${id}/settings`}
                className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Runs */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Runs
              </h2>
              <Link
                href={`/projects/${id}/runs`}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                View all →
              </Link>
            </div>

            {project.benchmarkRuns.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  No benchmark runs yet. Create your first run to see results
                  here.
                </p>
                <Link
                  href={`/projects/${id}/runs/new`}
                  className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Create Run
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {project.benchmarkRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/projects/${id}/runs/${run.id}`}
                    className="block p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {run.name}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                          {format(
                            new Date(run.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}{" "}
                          • {run._count.results} models
                        </p>
                      </div>
                      <RunStatusBadge status={run.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Start */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Start
            </h2>
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                  1. Configure Benchmark
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Set up your test cases, prompt template, and evaluation
                  criteria.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                  2. Select Models
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Choose which models to benchmark and compare.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                  3. Run & Analyze
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Execute the benchmark and view detailed results and
                  comparisons.
                </p>
              </div>
              <Link
                href={`/projects/${id}/runs/new`}
                className="block w-full rounded-md bg-zinc-900 px-4 py-2.5 text-center font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create New Run
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
