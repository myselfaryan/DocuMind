"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getToken } from "@/lib/client-auth"

interface OutlineCreatorProps {
  projectId: string
  documentType: "docx" | "pptx"
  projectTopic?: string
  onOutlineCreated: () => void
}

export function OutlineCreator({ projectId, documentType, projectTopic, onOutlineCreated }: OutlineCreatorProps) {
  const [sections, setSections] = useState<string[]>(["", ""])
  const [loading, setLoading] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [topicInput, setTopicInput] = useState(projectTopic || "")
  const [showTopicInput, setShowTopicInput] = useState(!projectTopic)

  const addSection = () => {
    setSections([...sections, ""])
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const updateSection = (index: number, value: string) => {
    const updated = [...sections]
    updated[index] = value
    setSections(updated)
  }

  const handleSuggestOutline = async () => {
    if (!topicInput.trim()) {
      alert("Please enter a topic for AI-suggested outline")
      return
    }

    setSuggestLoading(true)
    try {
      const token = getToken()
      const res = await fetch("/api/generate/suggest-outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          documentType,
          topic: topicInput,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSections(data.outline)
        setShowTopicInput(false)
      } else {
        const error = await res.json()
        alert(`Error: ${error.message || "Failed to generate outline"}`)
      }
    } catch (error) {
      console.error("Error suggesting outline:", error)
      alert("Failed to generate outline. Please try again.")
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleCreateOutline = async () => {
    const filledSections = sections.filter((s) => s.trim())
    if (filledSections.length === 0) return

    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/projects/${projectId}/outline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sections: filledSections,
        }),
      })

      if (res.ok) {
        onOutlineCreated()
      }
    } catch (error) {
      console.error("Error creating outline:", error)
    } finally {
      setLoading(false)
    }
  }

  const sectionLabel = documentType === "docx" ? "Section" : "Slide"

  return (
    <div className="space-y-6">
      {showTopicInput && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Main Topic</label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter your main topic to let AI generate relevant {sectionLabel.toLowerCase()}s
              </p>
              <div className="flex gap-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Market Analysis, Product Launch, Annual Report"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSuggestOutline()
                  }}
                />
                <Button
                  onClick={handleSuggestOutline}
                  disabled={suggestLoading || !topicInput.trim()}
                  className="whitespace-nowrap"
                >
                  {suggestLoading ? "Generating..." : "✨ Suggest"}
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTopicInput(false)}
              className="text-xs text-muted-foreground"
            >
              Skip AI Suggestions
            </Button>
          </div>
        </Card>
      )}

      {!showTopicInput && sections.some((s) => s.trim()) && (
        <Button variant="outline" size="sm" onClick={() => setShowTopicInput(true)} className="text-xs">
          Generate More with AI
        </Button>
      )}

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                {sectionLabel} {index + 1}
              </label>
              <Input
                value={section}
                onChange={(e) => updateSection(index, e.target.value)}
                placeholder={`Enter ${sectionLabel.toLowerCase()} title`}
              />
            </div>
            {sections.length > 1 && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addSection} className="w-full bg-transparent">
        + Add Another {sectionLabel}
      </Button>

      <Card className="bg-secondary/50 p-4">
        <p className="text-sm text-muted-foreground">
          {sections.filter((s) => s.trim()).length} {sectionLabel.toLowerCase()}(s) ready to generate
        </p>
      </Card>

      <Button
        className="w-full"
        onClick={handleCreateOutline}
        disabled={loading || sections.filter((s) => s.trim()).length === 0}
      >
        {loading ? "Creating Outline..." : "Create Outline & Generate Content"}
      </Button>
    </div>
  )
}
