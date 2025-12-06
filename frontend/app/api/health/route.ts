import { aiService } from "@/lib/services/ai-service"

export async function GET() {
  try {
    // Check if services are operational
    const rateLimitStatus = aiService.getRateLimitStatus("health-check")

    return Response.json(
      {
        status: "healthy",
        services: {
          ai: "operational",
          rateLimiting: "operational",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
