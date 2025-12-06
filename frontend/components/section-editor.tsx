"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RefinementHistory } from "./refinement-history"
import { getToken } from "@/lib/client-auth"
import { useToast } from "@/hooks/use-toast"
import { Wand2, RotateCcw, History } from "lucide-react"

interface Refinement {
  id: string
  prompt: string
  refined_content: string
  likes: number
  dislikes: number
  created_at: string
}

interface SectionEditorProps {
  sectionId: string
  sectionTitle: string
  projectTopic: string
  initialContent?: string
  onContentGenerated: (content: string) => void
}

export function SectionEditor({
  sectionId,
  sectionTitle,
  projectTopic,
  initialContent = "",
  onContentGenerated,
}: SectionEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [refinementPrompt, setRefinementPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setContent(initialContent || "")
    setRefinementPrompt("")
    setShowHistory(false)
  }, [sectionId, initialContent])

  const handleGenerateContent = async () => {
    setGenerating(true)
    try {
      const token = getToken()
      const res = await fetch("/api/generate/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionId,
          sectionTitle,
          projectTopic,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
        onContentGenerated(data.content)
        toast({
          title: "Content generated",
          description: "Your section content has been created",
        })
      } else {
        const error = await res.json()
        throw new Error(error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate content"
      console.error("Error generating content:", error)
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleRefineContent = async () => {
    if (!refinementPrompt.trim()) {
      toast({
        title: "Empty refinement",
        description: "Please enter a refinement prompt",
        variant: "destructive",
      })
      return
    }

    setRefining(true)
    try {
      const token = getToken()
      const res = await fetch("/api/generate/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionId,
          currentContent: content,
          refinementPrompt,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
        setRefinementPrompt("")
        onContentGenerated(data.content)
        toast({
          title: "Content refined",
          description: "Your section has been updated",
        })
      } else {
        const error = await res.json()
        throw new Error(error.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to refine content"
      console.error("Error refining content:", error)
      toast({
        title: "Refinement failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setRefining(false)
    }
  }

  const handleUseRefinement = (refinement: Refinement) => {
    setContent(refinement.refined_content)
    onContentGenerated(refinement.refined_content)
    setShowHistory(false)
    toast({
      title: "Content updated",
      description: "Applied refinement to this section",
    })
  }

  const handleResetContent = () => {
    setContent(initialContent)
    setRefinementPrompt("")
    toast({
      title: "Reset to original",
      description: "Reverted to initial content",
    })
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleGenerateContent} disabled={generating} variant="default" className="gap-2">
          {generating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Content
            </>
          )}
        </Button>
        <Button onClick={() => setShowHistory(!showHistory)} variant="outline" className="gap-2">
          <History className="w-4 h-4" />
          {showHistory ? "Hide" : "Show"} History
        </Button>
        {content && (
          <Button onClick={handleResetContent} variant="outline" className="gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Content Editor */}
      {content && (
        <Card className="p-6 border-2 border-border hover:border-primary/50 transition">
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Current Content</p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-48 resize-vertical font-mono text-sm leading-relaxed"
              placeholder="Content will appear here..."
            />
          </div>

          {/* Refinement Controls */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Refine This Section</p>
            <Input
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleRefineContent()
                }
              }}
              placeholder="E.g., Make this more formal, add statistics, shorten to 100 words..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleRefineContent}
                disabled={refining || !refinementPrompt.trim()}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                {refining ? "Refining..." : "Apply Refinement"}
              </Button>
              <Button onClick={() => setRefinementPrompt("")} variant="ghost" disabled={!refinementPrompt}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Refinement History */}
      {showHistory && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <History className="w-4 h-4" />
            Refinement History
          </h3>
          <RefinementHistory sectionId={sectionId} onSelectRefinement={handleUseRefinement} />
        </div>
      )}
    </div>
  )
}
