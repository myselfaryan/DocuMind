"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectModal } from "@/components/create-project-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { getToken, removeToken } from "@/lib/client-auth"
import { Plus, LogOut, Sparkles, BookOpen } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface Project {
  id: string
  topic: string
  document_type: "docx" | "pptx"
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = getToken()
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        console.log("Fetched projects:", data)
        setProjects(data)
      } else if (res.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    router.push("/")
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">My Projects</h1>
              <p className="text-lg text-muted-foreground">Manage and refine your AI-generated documents</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
              <ModeToggle />
              <Button variant="outline" onClick={handleLogout} className="rounded-full px-6 border-2 hover:bg-secondary">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Create New Project Button */}
          <div className="mb-12">
            <button
              onClick={() => setShowModal(true)}
              className="w-full md:w-auto group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full text-lg font-medium transition-transform active:scale-95 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Project</span>
              <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-border/50">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-3 text-foreground">No projects yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Create your first document project to get started with AI-powered generation and refinement.
              </p>
              <Button onClick={() => setShowModal(true)} size="lg" className="rounded-full px-8">
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  topic={project.topic}
                  documentType={project.document_type}
                  createdAt={project.created_at}
                  onDelete={fetchProjects}
                />
              ))}
            </div>
          )}
        </div>

        {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onProjectCreated={fetchProjects} />}
      </main>
    </ProtectedRoute>
  )
}
