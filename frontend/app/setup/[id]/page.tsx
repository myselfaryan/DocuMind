"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OutlineCreator } from "@/components/outline-creator"
import { ProtectedRoute } from "@/components/protected-route"
import { getToken } from "@/lib/client-auth"
import { ChevronLeft, Sparkles } from "lucide-react"

interface Project {
  id: string
  topic: string
  document_type: "docx" | "pptx"
}

export default function SetupPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = getToken()
        const res = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setProject(data[0])
        } else {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router])

  if (loading || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="p-8 border-2 border-border">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">{project.topic}</h1>
              </div>
              <p className="text-muted-foreground">
                {project.document_type === "docx" ? "Word Document" : "PowerPoint Presentation"} • Set up your structure
                with AI
              </p>
            </div>

            <OutlineCreator
              projectId={project.id}
              documentType={project.document_type}
              projectTopic={project.topic}
              onOutlineCreated={() => router.push(`/editor/${project.id}`)}
            />
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
