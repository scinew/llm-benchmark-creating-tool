import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api/handler";
import { paginatedResponse } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { DEFAULT_PAGINATION } from "@/lib/constants";

// GET /api/runs/:id/results - Get results for a run
async function getResults(req: NextRequest, params: { id: string }) {
  const { id: runId } = params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(
    searchParams.get("page") || String(DEFAULT_PAGINATION.PAGE)
  );
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(DEFAULT_PAGINATION.MAX_LIMIT)),
    DEFAULT_PAGINATION.MAX_LIMIT
  );
  const modelName = searchParams.get("model") || undefined;
  const skip = (page - 1) * limit;

  // Check if run exists
  const run = await prisma.benchmarkRun.findUnique({ where: { id: runId } });
  if (!run) {
    throw new ApiError("Run not found", 404);
  }

  const whereClause: Record<string, unknown> = { runId };
  if (modelName) {
    whereClause.modelName = modelName;
  }

  const [results, total] = await Promise.all([
    prisma.benchmarkResult.findMany({
      where: whereClause,
      orderBy: { score: "desc" },
      skip,
      take: limit,
    }),
    prisma.benchmarkResult.count({ where: whereClause }),
  ]);

  // Calculate summary
  const completedResults = results.filter((r) => r.score > 0);
  const summary = {
    totalResults: results.length,
    totalModels: await prisma.benchmarkResult.count({ where: { runId } }),
    averageScore:
      completedResults.length > 0
        ? completedResults.reduce((sum, r) => sum + r.score, 0) /
          completedResults.length
        : null,
    highestScorer:
      completedResults.length > 0
        ? completedResults.reduce(
            (max, r) => (r.score > max.score ? r : max),
            completedResults[0]
          )
        : null,
  };

  return paginatedResponse({ results, summary }, { page, limit, total });
}

export const GET = withErrorHandling(getResults);
