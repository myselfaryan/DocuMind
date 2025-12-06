import { exportService } from "@/lib/services/export-service"
import { verifyToken } from "@/lib/auth"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    // We can skip local verification and trust the backend response
    // const token = authHeader.slice(7)
    // const payload = await verifyToken(token)
    // if (!payload) {
    //   return Response.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const { projectId } = await request.json()

    // Fetch project details from backend
    // Since we don't have GET /project/{id}, we use list and filter
    const projectRes = await fetch(`${BACKEND_URL}/project/list`, {
      headers: { Authorization: authHeader },
    })

    if (!projectRes.ok) {
      return Response.json({ message: "Error fetching project" }, { status: projectRes.status })
    }

    const projects = await projectRes.json()
    const project = projects.find((p: any) => p.id.toString() === projectId)

    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 })
    }

    // Sections are included in the project object from the list endpoint
    const sections = project.sections.map((s: any) => ({
      title: s.title,
      content: s.generated_content,
    }))

    let buffer: Buffer | ArrayBuffer
    let contentType: string
    let extension: string

    if (project.document_type === "docx") {
      buffer = await exportService.exportToDocx(project.topic, sections, {
        filename: `${project.topic}.docx`,
      })
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      extension = "docx"
    } else {
      buffer = await exportService.exportToPptx(project.topic, sections, {
        filename: `${project.topic}.pptx`,
      })
      contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      extension = "pptx"
    }

    const filename = `${project.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${extension}`

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting document:", error)
    const message = error instanceof Error ? error.message : "Error exporting document"
    return Response.json({ message }, { status: 500 })
  }
}
