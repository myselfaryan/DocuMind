const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${BACKEND_URL}/project/${id}`, {
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      return Response.json({ message: "Error fetching project" }, { status: res.status })
    }

    const project = await res.json()

    // Map to frontend format
    // Backend returns ProjectOut: { id, topic, document_type, sections, created_at? }
    // Frontend expects array for some reason in setup page? 
    // "setProject(data[0])" in setup/page.tsx implies it expects an array.
    // Let's check setup/page.tsx again.
    // Yes: "const data = await res.json(); setProject(data[0])"
    // So we must return an array with one item to maintain compatibility with frontend code.

    return Response.json([{
      id: project.id,
      topic: project.topic,
      document_type: project.document_type,
      created_at: new Date().toISOString() // Backend might not return created_at yet
    }])

  } catch (error) {
    console.error("Error fetching project:", error)
    return Response.json({ message: "Error fetching project" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${BACKEND_URL}/project/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    })

    if (!res.ok) {
      return Response.json({ message: "Error deleting project" }, { status: res.status })
    }

    return Response.json({ message: "Project deleted successfully" })

  } catch (error) {
    console.error("Error deleting project:", error)
    return Response.json({ message: "Error deleting project" }, { status: 500 })
  }
}
