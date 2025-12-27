import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api/handler";
import { paginatedResponse, createdResponse } from "@/lib/api/response";
import { createProjectSchema } from "@/lib/validations/benchmark";
import { DEFAULT_PAGINATION } from "@/lib/constants";

// Type for JSON value compatible with Prisma
type JsonValue = Record<string, unknown>;

// GET /api/projects - List all projects for demo user
async function getProjects(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(
    searchParams.get("page") || String(DEFAULT_PAGINATION.PAGE)
  );
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(DEFAULT_PAGINATION.LIMIT)),
    DEFAULT_PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  // For demo purposes, use a demo user or first user
  const demoUser = await prisma.user.findFirst();

  if (!demoUser) {
    // Create demo user if none exists
    await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
      },
    });

    return paginatedResponse([], { page, limit, total: 0 });
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { userId: demoUser.id },
      include: {
        _count: {
          select: { benchmarkRuns: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where: { userId: demoUser.id } }),
  ]);

  return paginatedResponse(projects, { page, limit, total });
}

// POST /api/projects - Create new project
async function createProject(req: NextRequest) {
  const body = await req.json();
  const validatedData = createProjectSchema.parse(body);

  // For demo purposes, use a demo user or first user
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
      },
    });
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: validatedData.name,
      description: validatedData.description ?? null,
      config: validatedData.config as JsonValue | undefined,
    },
  });

  return createdResponse(project, "Project created successfully");
}

export const GET = withErrorHandling(getProjects);
export const POST = withErrorHandling(createProject);
