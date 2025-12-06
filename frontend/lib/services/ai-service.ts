import { google } from "@ai-sdk/google"

// FIXME: Remove this hardcoded key once the environment variable is correctly updated in the deployment.
const FALLBACK_KEY = "AIzaSyDMmoHi-zx75aj0r36rgePQQnUibpn6C9k"

// Rate limiting store (in-memory for now; use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 10 // max requests per window

interface AIServiceConfig {
  useMock?: boolean
  model?: any
  maxRetries?: number
}

interface ContentGenerationRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
}

export class AIService {
  private useMock: boolean
  private model: any
  private maxRetries: number

  constructor(config: AIServiceConfig = {}) {
    let apiKey = process.env.GEMINI_API_KEY

    if (!apiKey || apiKey.startsWith("AIzaSyB")) {
      console.warn("[v0] Environment variable missing or contains old leaked key. Using provided fallback key.")
      apiKey = FALLBACK_KEY
    }

    console.log("[v0] AIService init - API Key present:", !!apiKey)
    if (apiKey) {
      console.log("[v0] API Key starts with:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4))
    }

    this.useMock = config.useMock ?? (process.env.NODE_ENV === "test" || !apiKey)

    if (!this.useMock && apiKey) {
      try {
        this.model = google("gemini-2.0-flash-001", { apiKey })
        console.log("[v0] Gemini model initialized successfully (gemini-2.0-flash-001)")
      } catch (e) {
        console.error("[v0] Failed to initialize Gemini model:", e)
        this.useMock = true
      }
    } else {
      console.log("[v0] Using mock mode. Is test:", process.env.NODE_ENV === "test", "Has API key:", !!apiKey)
      this.model = null
    }

    this.maxRetries = config.maxRetries ?? 3
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const userLimit = rateLimitStore.get(userId)

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
      return true
    }

    if (userLimit.count >= RATE_LIMIT_MAX) {
      return false
    }

    userLimit.count++
    return true
  }

  async generateContent(request: ContentGenerationRequest, userId?: string): Promise<string> {
    try {
      // Check rate limit if userId provided
      if (userId && !this.checkRateLimit(userId)) {
        throw new Error("Rate limit exceeded. Please try again later.")
      }

      if (this.useMock) {
        console.log("[v0] Using mock response")
        return this.generateMockContent(request.prompt)
      }

      return await this.callAI(request)
    } catch (error) {
      console.error("[v0] AI Service error:", error)
      throw this.handleError(error)
    }
  }

  private async callAI(request: ContentGenerationRequest): Promise<string> {
    let apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.startsWith("AIzaSyB")) {
      apiKey = FALLBACK_KEY
    }

    if (!apiKey) {
      throw new Error("AI model not configured. Please add GEMINI_API_KEY environment variable.")
    }

    let lastError: Error | null = null

    // Use direct fetch to bypass SDK validation issues
    const model = "gemini-2.0-flash-001"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[v0] AI attempt ${attempt}/${this.maxRetries}: Calling Gemini API directly (${model})`)

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: request.prompt }],
              },
            ],
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens ?? 2000,
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[v0] Gemini API error (Status ${response.status}):`, errorText)
          throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        console.log(`[v0] Gemini API response received`)

        // Extract text from Gemini response structure
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
          console.error("[v0] Unexpected Gemini response structure:", JSON.stringify(data, null, 2))
          throw new Error("Empty or invalid response format from Gemini API")
        }

        console.log(`[v0] Response preview: ${text.substring(0, 100)}`)
        return text.trim()
      } catch (error) {
        lastError = error as Error

        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`[v0] Attempt ${attempt} error:`, errorMessage)

        // Don't retry on auth errors
        if (
          errorMessage.includes("API key") ||
          errorMessage.includes("401") ||
          errorMessage.includes("403") ||
          errorMessage.includes("INVALID_ARGUMENT")
        ) {
          throw new Error(`AI Service Error: ${errorMessage}`)
        }

        // Exponential backoff
        if (attempt < this.maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000
          console.log(`[v0] Retrying in ${delayMs}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }

    throw new Error(
      `Failed to generate content after ${this.maxRetries} attempts. Last error: ${lastError?.message || "Unknown"}`,
    )
  }

  private generateMockContent(prompt: string): string {
    const mockResponses: Record<string, string> = {
      outline5: `1. Introduction & Executive Summary
2. Market Analysis & Trends
3. Product Overview & Features
4. Implementation Strategy & Timeline
5. Conclusion & Next Steps`,
      outline8: `1. Title Slide
2. Executive Overview
3. Market Analysis
4. Problem Statement
5. Proposed Solution
6. Implementation Plan
7. Expected Results
8. Questions & Discussion`,
      section:
        "This is a comprehensive section covering all relevant aspects of the topic with professional detail, clear structure, and actionable insights suitable for business documentation.",
      refinement:
        "This refined version improves upon the original while maintaining the core message, now featuring enhanced clarity, professional language, and better organization.",
    }

    if (prompt.includes("slide titles") || prompt.includes("slide")) {
      return mockResponses.outline8
    }
    if (prompt.includes("section titles") || prompt.includes("document")) {
      return mockResponses.outline5
    }
    if (prompt.includes("section")) {
      return mockResponses.section
    }
    if (prompt.includes("refine")) {
      return mockResponses.refinement
    }

    return `Mock response generated for prompt about: ${prompt.substring(0, 50)}...`
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error("An unexpected error occurred with the AI service")
  }

  // Enable/disable mock mode dynamically
  setMockMode(useMock: boolean) {
    console.log("[v0] Mock mode set to:", useMock)
    this.useMock = useMock
  }

  // Get current rate limit status
  getRateLimitStatus(userId: string) {
    const userLimit = rateLimitStore.get(userId)
    const now = Date.now()

    if (!userLimit || now > userLimit.resetTime) {
      return { remaining: RATE_LIMIT_MAX, resetIn: 0 }
    }

    return {
      remaining: Math.max(0, RATE_LIMIT_MAX - userLimit.count),
      resetIn: userLimit.resetTime - now,
    }
  }
}

export const aiService = new AIService()
