import { aiService } from "@/lib/services/ai-service"

export function getRateLimitHeaders(userId: string) {
  const status = aiService.getRateLimitStatus(userId)
  return {
    "X-RateLimit-Remaining": status.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(status.resetIn / 1000).toString(),
  }
}

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; resetIn: number }> {
  const status = aiService.getRateLimitStatus(userId)
  return {
    allowed: status.remaining > 0,
    resetIn: status.resetIn,
  }
}
