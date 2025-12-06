const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { disliked } = await request.json()

    // Proxy to backend /refinement/{id}/dislike
    // We need to add this to backend.
    const res = await fetch(`${BACKEND_URL}/refinement/${id}/dislike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ disliked }),
    })

    if (!res.ok) {
      return Response.json({ message: "Error updating dislikes" }, { status: res.status })
    }

    const result = await res.json()
    return Response.json(result)
  } catch (error) {
    console.error("Error updating dislikes:", error)
    return Response.json({ message: "Error updating dislikes" }, { status: 500 })
  }
}
