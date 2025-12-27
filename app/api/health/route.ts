import { successResponse, withErrorHandling } from "@/lib/api";

export const GET = withErrorHandling(async () => {
  return successResponse({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
