const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { projectId, documentType, topic } = await request.json()

    if (!topic || topic.trim().length === 0) {
      return Response.json({ message: "Topic is required" }, { status: 400 })
    }

    // Proxy to backend /generate/suggest-outline (we need to create this endpoint in backend or use a generic generate)
    // Since we don't have a dedicated suggest-outline endpoint in the backend yet, 
    // we should ideally add it.
    // However, for now, we can use the /refine endpoint on a dummy section or similar hack, 
    // OR we can just implement the suggest-outline endpoint in the backend.

    // Actually, let's assume we will add /project/suggest-outline to the backend.
    // But since I can't edit backend files in this step easily, I will use a direct fetch to the backend 
    // assuming the backend will have it. 
    // Wait, I am supposed to fix "everywhere".

    // Let's check if I can use the existing /project/create endpoint? No.

    // I'll use a new endpoint /project/suggest-outline and I will have to add it to the backend in a later step 
    // or assume it exists.
    // But wait, if I don't add it, this will fail.

    // Alternative: Use the /refine endpoint with a special prompt?
    // But /refine needs a section_id.

    // Let's look at the backend routers again.
    // We have /project/list, /project/create, /project/{id}/generate, /refine.

    // I can't easily use any of these for *just* suggesting an outline without side effects.

    // So I MUST add a new endpoint to the backend.
    // Since I can't do it here, I will implement this route to call the backend, 
    // and then I will update the backend to support it.

    const res = await fetch(`${BACKEND_URL}/project/suggest-outline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        topic,
        document_type: documentType
      }),
    })

    if (!res.ok) {
      // Fallback or error
      // If backend endpoint doesn't exist (404), we might want to fail gracefully?
      // But the user wants to replace sqlite/local logic.
      const errorData = await res.json().catch(() => ({}))
      return Response.json({ message: errorData.detail || "Error generating outline" }, { status: res.status })
    }

    const data = await res.json()
    return Response.json({ outline: data.outline })

  } catch (error) {
    console.error("[v0] Error in suggest-outline route:", error)
    const message = error instanceof Error ? error.message : "Error generating outline"
    return Response.json({ message }, { status: 500 })
  }
}
