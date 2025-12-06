"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/client-auth"
import { useToast } from "@/hooks/use-toast"
import { Download } from "lucide-react"

interface ExportButtonProps {
  projectId: string
  projectTopic: string
  documentType: "docx" | "pptx"
}

export function ExportButton({ projectId, projectTopic, documentType }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setExporting(true)
    try {
      const token = getToken()
      const res = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${projectTopic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${documentType}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export successful",
          description: `Your ${documentType.toUpperCase()} file has been downloaded.`,
        })
      } else {
        let errorMessage = "Export failed"
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Export failed: ${res.status} ${res.statusText}`
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export document"
      console.error("Error exporting:", error)
      toast({
        title: "Export failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} className="gap-2" variant="default">
      {exporting ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export {documentType.toUpperCase()}
        </>
      )}
    </Button>
  )
}
