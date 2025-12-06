"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Play, Calendar, ChevronRight, Trash2 } from "lucide-react"
import { getToken } from "@/lib/client-auth"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProjectCardProps {
  id: string
  topic: string
  documentType: "docx" | "pptx"
  createdAt: string
  onDelete?: () => void
}

export function ProjectCard({ id, topic, documentType, createdAt, onDelete }: ProjectCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const Icon = documentType === "docx" ? FileText : Play

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${topic}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        toast({
          title: "Project deleted",
          description: "The project has been successfully deleted.",
        })
        onDelete?.()
      } else {
        throw new Error("Failed to delete project")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 h-full border-2 border-border hover:border-primary/50 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-accent/20 text-accent px-3 py-1 rounded-full">
            {documentType === "docx" ? "Document" : "Presentation"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
        {topic}
      </h3>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Calendar className="w-4 h-4" />
        <span>{date}</span>
      </div>

      <Button
        variant="default"
        size="sm"
        className="w-full gap-2 font-semibold"
        onClick={() => router.push(`/setup/${id}`)}
      >
        Open Project
        <ChevronRight className="w-4 h-4" />
      </Button>
    </Card>
  )
}
