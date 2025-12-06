"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getToken } from "@/lib/client-auth"
import { useToast } from "@/hooks/use-toast"
import { FileText, Play, ChevronLeft, Loader2, AlertCircle } from "lucide-react"

interface CreateProjectModalProps {
  onClose: () => void
  onProjectCreated: () => void
}

export function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState<"type" | "details">("type")
  const [documentType, setDocumentType] = useState<"docx" | "pptx" | null>(null)
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleTypeSelect = (type: "docx" | "pptx") => {
    setDocumentType(type)
    setStep("details")
    setError("")
  }

  const handleCreate = async () => {
    if (!documentType || !topic.trim()) {
      setError("Please enter a project topic")
      return
    }

    setLoading(true)
    setError("")
    try {
      const token = getToken()
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType,
          topic,
        }),
      })

      if (res.ok) {
        toast({
          title: "Project created",
          description: `Your ${documentType.toUpperCase()} project is ready`,
        })
        onProjectCreated()
        onClose()
      } else {
        const data = await res.json()
        const errorMessage = typeof data.message === 'string'
          ? data.message
          : JSON.stringify(data.message || data.detail || "Failed to create project")
        setError(errorMessage)
      }
    } catch (error) {
      console.error("Error creating project:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-2 border-border shadow-2xl">
        <div className="p-8">
          {step === "type" ? (
            <>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Create New Project</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose your document type to get started</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleTypeSelect("docx")}
                  className="w-full p-5 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Word Document</div>
                      <p className="text-sm text-muted-foreground">.docx format - Reports, proposals, guides</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect("pptx")}
                  className="w-full p-5 border-2 border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      <Play className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">PowerPoint Presentation</div>
                      <p className="text-sm text-muted-foreground">.pptx format - Slideshows, presentations</p>
                    </div>
                  </div>
                </button>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep("type")} className="p-1 hover:bg-secondary rounded transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-2xl font-bold text-foreground">Project Details</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Type:{" "}
                <span className="font-semibold text-foreground">
                  {documentType === "docx" ? "Word Document" : "PowerPoint Presentation"}
                </span>
              </p>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg mb-4 flex gap-2 items-start text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-foreground">Project Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Annual Report 2024"
                  disabled={loading}
                  className="text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && topic.trim()) {
                      handleCreate()
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setStep("type")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleCreate}
                  disabled={!topic.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
