import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";

// GET /api/runs/:id - Get run details
async function getRun(req: NextRequest, params: { id: string }) {
  const { id } = params;

  const run = await prisma.benchmarkRun.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true },
      },
      results: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!run) {
    throw new ApiError("Run not found", 404);
  }

  // Calculate summary stats
  const completedResults = run.results.filter((r) => r.score > 0);
  const summary = {
    totalModels: run.results.length,
    completedCount: completedResults.length,
    failedCount: run.results.filter((r) => {
      const meta = r.metadata as Record<string, unknown> | undefined;
      return meta?.taskStatus === "FAILED";
    }).length,
    averageScore:
      completedResults.length > 0
        ? completedResults.reduce((sum, r) => sum + r.score, 0) /
          completedResults.length
        : null,
    minScore:
      completedResults.length > 0
        ? Math.min(...completedResults.map((r) => r.score))
        : null,
    maxScore:
      completedResults.length > 0
        ? Math.max(...completedResults.map((r) => r.score))
        : null,
  };

  return successResponse({ ...run, summary });
}

export const GET = withErrorHandling(getRun);
