const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { liked } = await request.json()

    // Proxy to backend /refinement/{id}/like
    // We need to add this to backend.
    const res = await fetch(`${BACKEND_URL}/refinement/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ liked }),
    })

    if (!res.ok) {
      return Response.json({ message: "Error updating likes" }, { status: res.status })
    }

    const result = await res.json()
    return Response.json(result)
  } catch (error) {
    console.error("Error updating likes:", error)
    return Response.json({ message: "Error updating likes" }, { status: 500 })
  }
}
