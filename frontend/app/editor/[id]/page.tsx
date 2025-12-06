"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SectionEditor } from "@/components/section-editor"
import { ExportButton } from "@/components/export-button"
import { ProtectedRoute } from "@/components/protected-route"
import { getToken } from "@/lib/client-auth"

interface Section {
  id: string
  title: string
  section_index: number
  generated_content?: string
}

interface Project {
  id: string
  topic: string
  document_type: "docx" | "pptx"
}

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [activeSectionId, setActiveSectionId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [generatingAll, setGeneratingAll] = useState(false)

  useEffect(() => {
    const fetchProjectAndSections = async () => {
      try {
        const token = getToken()

        const projectRes = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!projectRes.ok) {
          router.push("/dashboard")
          return
        }

        const projectData = await projectRes.json()
        setProject(projectData[0])

        const sectionsRes = await fetch(`/api/projects/${projectId}/outline`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json()
          setSections(sectionsData)
          if (sectionsData.length > 0) {
            setActiveSectionId(sectionsData[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectAndSections()
  }, [projectId, router])

  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    try {
      const token = getToken()

      // Use the backend's generate endpoint which generates content for ALL sections
      const res = await fetch(`/api/projects/${projectId}/outline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sections: sections.map(s => s.title) // Re-send titles to trigger generation if needed, or we should have a dedicated generate endpoint
        }),
      })

      // Actually, the previous implementation of /api/projects/[id]/outline POST calls /project/{id}/generate
      // which generates content for all sections.
      // So we can just call that again with the existing sections.

      if (res.ok) {
        const updatedSections = await res.json()
        setSections(updatedSections)
      } else {
        console.error("Failed to generate all sections")
      }

    } catch (error) {
      console.error("Error generating all:", error)
    } finally {
      setGeneratingAll(false)
    }
  }

  if (loading || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const activeSection = sections.find((s) => s.id === activeSectionId)

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-2">
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold">{project.topic}</h1>
              <p className="text-muted-foreground">Editing {project.document_type.toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerateAll} disabled={generatingAll}>
                {generatingAll ? "Generating..." : "Generate All Sections"}
              </Button>
              <ExportButton projectId={projectId} projectTopic={project.topic} documentType={project.document_type} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sections List */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${activeSectionId === section.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-muted"
                        }`}
                    >
                      <div className="text-sm font-medium">{section.title}</div>
                      {section.generated_content && <div className="text-xs mt-1 opacity-70">✓ Generated</div>}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Editor */}
            <div className="lg:col-span-3">
              {activeSection ? (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">{activeSection.title}</h2>
                  <SectionEditor
                    sectionId={activeSection.id}
                    sectionTitle={activeSection.title}
                    projectTopic={project.topic}
                    initialContent={activeSection.generated_content}
                    onContentGenerated={(content) => {
                      setSections(
                        sections.map((s) => (s.id === activeSection.id ? { ...s, generated_content: content } : s)),
                      )
                    }}
                  />
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No sections found</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
