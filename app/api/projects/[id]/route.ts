import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import { withErrorHandling } from "@/lib/api/handler";
import { noContentResponse, successResponse } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations/benchmark";

// GET /api/projects/:id - Get project details
async function getProject(req: NextRequest, params: { id: string }) {
  const { id } = params;

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

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  return successResponse(project);
}

// PUT /api/projects/:id - Update project
async function updateProject(req: NextRequest, params: { id: string }) {
  const { id } = params;
  const body = await req.json();
  const validatedData = updateProjectSchema.parse(body);

  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject) {
    throw new ApiError("Project not found", 404);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: validatedData.name ?? undefined,
      description: validatedData.description ?? null,
      config: validatedData.config as Prisma.InputJsonValue | undefined,
    },
  });

  return successResponse(project);
}

// DELETE /api/projects/:id - Delete project
async function deleteProject(req: NextRequest, params: { id: string }) {
  const { id } = params;

  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject) {
    throw new ApiError("Project not found", 404);
  }

  await prisma.project.delete({ where: { id } });

  return noContentResponse();
}

export const GET = withErrorHandling(getProject);
export const PUT = withErrorHandling(updateProject);
export const DELETE = withErrorHandling(deleteProject);
