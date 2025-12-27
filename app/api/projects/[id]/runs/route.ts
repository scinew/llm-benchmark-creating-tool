import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api/handler";
import {
  successResponse,
  paginatedResponse,
  createdResponse,
} from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { createBenchmarkRunSchema } from "@/lib/validations/benchmark";
import { DEFAULT_PAGINATION } from "@/lib/constants";

// Type for JSON value compatible with Prisma
type JsonValue = Record<string, unknown>;

// GET /api/projects/:id/runs - List runs for a project
async function getRuns(req: NextRequest, params: { id: string }) {
  const { id: projectId } = params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(
    searchParams.get("page") || String(DEFAULT_PAGINATION.PAGE)
  );
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(DEFAULT_PAGINATION.LIMIT)),
    DEFAULT_PAGINATION.MAX_LIMIT
  );
  const status = searchParams.get("status") || undefined;
  const skip = (page - 1) * limit;

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  const whereClause: Record<string, unknown> = { projectId };
  if (status) {
    whereClause.status = status;
  }

  const [runs, total] = await Promise.all([
    prisma.benchmarkRun.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { results: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.benchmarkRun.count({ where: whereClause }),
  ]);

  return paginatedResponse(runs, { page, limit, total });
}

// POST /api/projects/:id/runs - Create a new benchmark run
async function createRun(req: NextRequest, params: { id: string }) {
  const { id: projectId } = params;
  const body = await req.json();
  const validatedData = createBenchmarkRunSchema.parse(body);

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  // Generate execution tasks from config + selected models
  const tasks = validatedData.selectedModels.map((modelName) => ({
    modelName,
    status: "PENDING" as const,
  }));

  // Create run with transaction
  const run = await prisma.$transaction(async (tx) => {
    const newRun = await tx.benchmarkRun.create({
      data: {
        projectId,
        name: validatedData.name,
        config: validatedData.config as JsonValue,
        status: "PENDING",
      },
    });

    // Store selected models in metadata for reference
    await tx.benchmarkResult.createMany({
      data: tasks.map((task) => ({
        runId: newRun.id,
        modelName: task.modelName,
        score: 0,
        metadata: {
          taskStatus: "PENDING",
          selectedAt: new Date().toISOString(),
        },
      })),
    });

    return newRun;
  });

  // Fetch complete run with results
  const completeRun = await prisma.benchmarkRun.findUnique({
    where: { id: run.id },
    include: {
      results: true,
    },
  });

  return createdResponse(completeRun, "Benchmark run created successfully");
}

export const GET = withErrorHandling(getRuns);
export const POST = withErrorHandling(createRun);
