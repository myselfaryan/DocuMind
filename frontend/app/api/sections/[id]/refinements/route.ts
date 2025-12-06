const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Proxy to backend /section/{id}/refinements
    // We need to add this to backend.
    const res = await fetch(`${BACKEND_URL}/section/${id}/refinements`, {
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      if (res.status === 404) return Response.json([])
      return Response.json({ message: "Error fetching refinements" }, { status: res.status })
    }

    const refinements = await res.json()
    return Response.json(refinements)
  } catch (error) {
    console.error("Error fetching refinements:", error)
    return Response.json({ message: "Error fetching refinements" }, { status: 500 })
  }
}
