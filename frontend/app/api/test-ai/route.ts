const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { testType = "text", useMock = false } = await request.json()

    // Proxy to backend /test-ai (we need to create this endpoint in backend)
    const res = await fetch(`${BACKEND_URL}/test-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ testType, useMock }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return Response.json({ message: errorData.detail || "Error testing AI" }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
