export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
