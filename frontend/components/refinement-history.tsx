"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getToken } from "@/lib/client-auth"
import { useToast } from "@/hooks/use-toast"
import { ThumbsUp, ThumbsDown, MessageSquare, Copy, CheckCircle2 } from "lucide-react"

interface Refinement {
  id: string
  prompt: string
  refined_content: string
  likes: number
  dislikes: number
  created_at: string
}

interface Comment {
  id: string
  content: string
  created_at: string
}

interface RefinementHistoryProps {
  sectionId: string
  onSelectRefinement: (refinement: Refinement) => void
}

export function RefinementHistory({ sectionId, onSelectRefinement }: RefinementHistoryProps) {
  const [refinements, setRefinements] = useState<Refinement[]>([])
  const [expandedRefinement, setExpandedRefinement] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRefinements()
  }, [sectionId])

  const fetchRefinements = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`/api/sections/${sectionId}/refinements`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setRefinements(data)
      }
    } catch (error) {
      console.error("Error fetching refinements:", error)
      toast({
        title: "Error loading refinements",
        description: "Failed to load refinement history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (refinementId: string) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/refinements/${refinementId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setComments((prev) => ({ ...prev, [refinementId]: data }))
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleAddComment = async (refinementId: string) => {
    const comment = newComments[refinementId]?.trim()
    if (!comment) return

    try {
      const token = getToken()
      const res = await fetch(`/api/refinements/${refinementId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      })

      if (res.ok) {
        setNewComments((prev) => ({ ...prev, [refinementId]: "" }))
        await fetchComments(refinementId)
        toast({
          title: "Comment added",
          description: "Your feedback has been recorded",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error adding comment",
        description: "Failed to save your comment",
        variant: "destructive",
      })
    }
  }

  const handleLike = async (refinementId: string, currentLikes: number) => {
    try {
      const token = getToken()
      await fetch(`/api/refinements/${refinementId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ liked: currentLikes === 0 }),
      })

      setRefinements(refinements.map((r) => (r.id === refinementId ? { ...r, likes: currentLikes === 0 ? 1 : 0 } : r)))
      toast({
        title: currentLikes === 0 ? "Marked as helpful" : "Removed feedback",
        description: "",
      })
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleDislike = async (refinementId: string, currentDislikes: number) => {
    try {
      const token = getToken()
      await fetch(`/api/refinements/${refinementId}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disliked: currentDislikes === 0 }),
      })

      setRefinements(
        refinements.map((r) => (r.id === refinementId ? { ...r, dislikes: currentDislikes === 0 ? 1 : 0 } : r)),
      )
      toast({
        title: currentDislikes === 0 ? "Marked as unhelpful" : "Removed feedback",
        description: "",
      })
    } catch (error) {
      console.error("Error updating dislike:", error)
    }
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Content ready to paste",
    })
  }

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading refinements...</p>
      </Card>
    )
  }

  if (refinements.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground font-medium">No refinements yet</p>
        <p className="text-sm text-muted-foreground mt-1">Refine your content to see previous versions here</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {refinements.map((refinement) => (
        <Card key={refinement.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <button
            onClick={() => {
              setExpandedRefinement(expandedRefinement === refinement.id ? null : refinement.id)
              if (expandedRefinement !== refinement.id) {
                fetchComments(refinement.id)
              }
            }}
            className="w-full text-left p-4 hover:bg-muted/50 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{refinement.prompt}</p>
                <p className="text-xs text-muted-foreground">{new Date(refinement.created_at).toLocaleString()}</p>
              </div>
              <span className="text-lg flex-shrink-0">{expandedRefinement === refinement.id ? "▼" : "▶"}</span>
            </div>
          </button>

          {expandedRefinement === refinement.id && (
            <div className="border-t border-border bg-card p-4 space-y-4">
              {/* Content Preview */}
              <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {refinement.refined_content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={refinement.likes ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLike(refinement.id, refinement.likes)}
                  className="gap-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful
                </Button>
                <Button
                  variant={refinement.dislikes ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDislike(refinement.id, refinement.dislikes)}
                  className="gap-1"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyContent(refinement.refined_content)}
                  className="gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSelectRefinement(refinement)}
                  className="ml-auto gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Use This
                </Button>
              </div>

              {/* Comments Section */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Feedback ({comments[refinement.id]?.length || 0})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {comments[refinement.id]?.map((comment) => (
                    <div key={comment.id} className="bg-muted p-3 rounded-lg border border-border/50">
                      <p className="text-sm text-foreground">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    value={newComments[refinement.id] || ""}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [refinement.id]: e.target.value,
                      }))
                    }
                    placeholder="Share your feedback..."
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(refinement.id)}
                    disabled={!newComments[refinement.id]?.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
