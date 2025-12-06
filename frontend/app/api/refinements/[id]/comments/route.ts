const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Proxy to backend /refinement/{id}/comments
    // We need to add this to backend.
    const res = await fetch(`${BACKEND_URL}/refinement/${id}/comments`, {
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      // If 404, maybe return empty list?
      if (res.status === 404) return Response.json([])
      return Response.json({ message: "Error fetching comments" }, { status: res.status })
    }

    const comments = await res.json()
    return Response.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return Response.json({ message: "Error fetching comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return Response.json({ message: "Comment content required" }, { status: 400 })
    }

    // Proxy to backend /refinement/{id}/comments
    const res = await fetch(`${BACKEND_URL}/refinement/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ content }),
    })

    if (!res.ok) {
      return Response.json({ message: "Error creating comment" }, { status: res.status })
    }

    const comment = await res.json()
    return Response.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return Response.json({ message: "Error creating comment" }, { status: 500 })
  }
}
