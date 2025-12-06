const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ message: data.detail || "Registration failed" }, { status: res.status })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error("Registration proxy error:", error)
    return Response.json({ message: "Registration failed" }, { status: 500 })
  }
}
