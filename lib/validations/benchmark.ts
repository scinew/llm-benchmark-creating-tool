import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const updateProjectSchema = createProjectSchema
  .extend({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(100, "Project name must be less than 100 characters")
      .optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
  })
  .partial();

export const createBenchmarkRunSchema = z.object({
  name: z
    .string()
    .min(1, "Run name is required")
    .max(100, "Run name must be less than 100 characters"),
  config: z.record(z.string(), z.unknown()),
  selectedModels: z
    .array(z.string())
    .min(1, "At least one model must be selected"),
});

export const createBenchmarkResultSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  score: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const benchmarkRunQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateBenchmarkRunInput = z.infer<typeof createBenchmarkRunSchema>;
export type CreateBenchmarkResultInput = z.infer<
  typeof createBenchmarkResultSchema
>;
export type BenchmarkRunQuery = z.infer<typeof benchmarkRunQuerySchema>;
