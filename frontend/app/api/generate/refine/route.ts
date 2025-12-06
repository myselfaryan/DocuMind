const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { sectionId, currentContent, refinementPrompt } = await request.json()

    if (!sectionId || !currentContent || !refinementPrompt) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Proxy to backend /refine
    const res = await fetch(`${BACKEND_URL}/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        section_id: sectionId,
        prompt: refinementPrompt,
        comment: "", // Optional
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return Response.json({ message: errorData.detail || "Error refining content" }, { status: res.status })
    }

    const data = await res.json()
    // Backend returns { id, content, comment, ... }
    // Frontend expects { refinement, content }

    return Response.json({
      refinement: {
        id: data.id,
        prompt: refinementPrompt,
        original_content: currentContent,
        refined_content: data.generated_content,
        created_at: new Date().toISOString()
      },
      content: data.generated_content
    })

  } catch (error) {
    console.error("[v0] Error refining section:", error)
    const message = error instanceof Error ? error.message : "Error refining section"
    return Response.json({ message }, { status: 500 })
  }
}
