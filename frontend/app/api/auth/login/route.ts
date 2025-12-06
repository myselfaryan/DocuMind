const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ message: data.detail || "Login failed" }, { status: res.status })
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    console.error("Login proxy error:", error)
    return Response.json({ message: "Login failed" }, { status: 500 })
  }
}
