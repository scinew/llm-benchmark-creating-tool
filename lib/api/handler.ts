import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { errorResponse } from "./response";

type HandlerFn<
  T = unknown,
  TParams extends Record<string, string> = Record<string, string>,
> = (req: NextRequest, params: TParams) => Promise<NextResponse<T>>;

export function withErrorHandling<
  T,
  TParams extends Record<string, string> = Record<string, string>,
>(
  handler: HandlerFn<T, TParams>
): (
  req: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<NextResponse<T>> {
  return async (req, context) => {
    try {
      return await handler(req, await context.params);
    } catch (error) {
      return errorResponse(error) as unknown as NextResponse<T>;
    }
  };
}
