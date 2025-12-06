const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    // The backend doesn't have a direct "get sections" endpoint, but /project/list returns sections in ProjectOut.
    // Or we can use the /project/{id}/generate endpoint which returns sections.
    // But wait, we just want to GET sections.
    // Let's assume we need to fetch the project list and extract sections for now.

    const res = await fetch(`${BACKEND_URL}/project/list`, {
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      return Response.json({ message: "Error fetching projects" }, { status: res.status })
    }

    const projects = await res.json()
    const project = projects.find((p: any) => p.id.toString() === id)

    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 })
    }

    return Response.json(project.sections)

  } catch (error) {
    console.error("Error fetching sections:", error)
    return Response.json({ message: "Error fetching sections" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { sections } = await request.json()
    if (!Array.isArray(sections) || sections.length === 0) {
      return Response.json({ message: "Sections are required" }, { status: 400 })
    }

    // Proxy to backend /project/{id}/generate
    // The backend expects: { "section_titles": [...] }

    const res = await fetch(`${BACKEND_URL}/project/${id}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        section_titles: sections
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return Response.json({ message: errorData.detail || "Error generating content" }, { status: res.status })
    }

    const data = await res.json()
    // Backend returns ProjectOut, which contains sections
    return Response.json(data.sections, { status: 201 })

  } catch (error) {
    console.error("Error creating sections:", error)
    return Response.json({ message: "Error creating sections" }, { status: 500 })
  }
}
