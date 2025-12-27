export const APP_NAME = "LLM Benchmark Creator";

export const APP_DESCRIPTION =
  "Create and run benchmarks for LLM models to compare their performance";

export const BENCHMARK_RUN_STATUSES = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const API_ROUTES = {
  PROJECTS: "/api/projects",
  BENCHMARK_RUNS: "/api/benchmark-runs",
  BENCHMARK_RESULTS: "/api/benchmark-results",
  SAVED_MODELS: "/api/saved-models",
  USERS: "/api/users",
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "An internal server error occurred",
  INVALID_REQUEST: "Invalid request parameters",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  VALIDATION_ERROR: "Validation error",
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
} as const;
