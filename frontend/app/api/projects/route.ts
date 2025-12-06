const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${BACKEND_URL}/project/list`, {
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ message: data.detail || "Error fetching projects" }, { status: res.status })
    }

    // Map backend response to frontend expected format
    // Backend returns ProjectOut: { id, topic, document_type, sections }
    const projects = data.map((p: any) => ({
      id: p.id,
      topic: p.topic,
      document_type: p.document_type,
      created_at: new Date().toISOString(), // Backend doesn't return created_at in ProjectOut yet
    }))

    return Response.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return Response.json({ message: "Error fetching projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { documentType, topic } = await request.json()

    if (!documentType || !topic) {
      return Response.json({ message: "Document type and topic are required" }, { status: 400 })
    }

    const res = await fetch(`${BACKEND_URL}/project/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        topic: topic,
        document_type: documentType,
        outline: [],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ message: data.detail || "Error creating project" }, { status: res.status })
    }

    return Response.json({
      id: data.project_id,
      topic: topic,
      document_type: documentType,
      created_at: new Date().toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return Response.json({ message: "Error creating project" }, { status: 500 })
  }
}
