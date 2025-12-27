export type BenchmarkRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BenchmarkRun {
  id: string;
  projectId: string;
  name: string;
  status: BenchmarkRunStatus;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BenchmarkResult {
  id: string;
  runId: string;
  modelName: string;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface SavedModel {
  id: string;
  userId: string;
  modelName: string;
  modelLogo: string;
  source: string;
  addedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateBenchmarkRunInput {
  projectId: string;
  name: string;
  config: Record<string, unknown>;
}

export interface CreateBenchmarkResultInput {
  runId: string;
  modelName: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SaveModelInput {
  modelName: string;
  modelLogo: string;
  source: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
