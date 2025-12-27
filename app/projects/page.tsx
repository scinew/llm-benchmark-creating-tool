import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/ProjectCard";

async function getProjects() {
  // For demo purposes, use first user
  const user = await prisma.user.findFirst();

  if (!user) {
    // Create demo user if none exists
    const newUser = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
      },
    });
    return [];
  }

  return prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { benchmarkRuns: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Projects
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Manage your benchmark projects
            </p>
          </div>
          <Link
            href="/projects/new"
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              No projects yet
            </h2>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              Create your first benchmark project to get started
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                runCount={project._count.benchmarkRuns}
                updatedAt={project.updatedAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
