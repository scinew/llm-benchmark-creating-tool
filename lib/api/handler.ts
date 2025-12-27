import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { errorResponse } from "./response";

type HandlerContext = {
  params?: Record<string, string>;
};

type HandlerFn<T = unknown> = (
  req: NextRequest,
  context: HandlerContext
) => Promise<NextResponse<T>>;

export function withErrorHandling<T>(handler: HandlerFn<T>): HandlerFn<T> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error) as unknown as NextResponse<T>;
    }
  };
}
