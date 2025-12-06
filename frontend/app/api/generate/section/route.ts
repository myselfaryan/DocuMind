const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { sectionId, sectionTitle, projectTopic } = await request.json()

    if (!sectionId || !sectionTitle || !projectTopic) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Proxy to backend /project/{id}/generate
    // Wait, the backend generate endpoint generates ALL sections.
    // We need an endpoint to generate a SINGLE section.
    // The current backend doesn't seem to support single section generation explicitly via API 
    // unless we use the same /generate endpoint but that might regenerate everything?

    // Let's check backend/routers/project_router.py again.
    // It iterates over section_titles.

    // If we want to generate just one section, we might need to add a new endpoint to the backend 
    // OR we can use the refine endpoint with a specific prompt?

    // Actually, for now, since the user wants to replace SQLite, and the backend is the source of truth,
    // we should probably add a specific endpoint for single section generation.

    // BUT, I cannot modify the backend right now in this single step easily without context switching.
    // Let's look at what `updateSection` did. It updated the content.

    // If I use the /refine endpoint, it updates the content of a section!
    // So I can use /refine to "generate" the initial content if I phrase the prompt correctly.

    const res = await fetch(`${BACKEND_URL}/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        section_id: sectionId,
        prompt: `Write a comprehensive, professional section for a business document about "${projectTopic}" with the section title "${sectionTitle}". Requirements: Write between 150-300 words. Use clear, professional language.`,
        comment: "Initial generation",
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return Response.json({ message: errorData.detail || "Error generating section" }, { status: res.status })
    }

    const data = await res.json()

    return Response.json({ content: data.generated_content })

  } catch (error) {
    console.error("[v0] Error generating section:", error)
    const message = error instanceof Error ? error.message : "Error generating section"
    return Response.json({ message }, { status: 500 })
  }
}
