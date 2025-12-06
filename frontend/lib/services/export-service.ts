import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx"
import PptxGenJS from "pptxgenjs"

interface DocumentSection {
  id?: string
  title: string
  content?: string
}

interface ExportOptions {
  filename: string
  author?: string
  created?: Date
}

export class ExportService {
  async exportToDocx(
    projectTitle: string,
    sections: DocumentSection[],
    options: ExportOptions = { filename: "document.docx" },
  ): Promise<Buffer> {
    try {
      const paragraphs: Paragraph[] = []

      // Title page
      paragraphs.push(
        new Paragraph({
          text: projectTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200, before: 200 },
          thematicBreak: false,
        }),
      )

      paragraphs.push(
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          color: "666666",
        }),
      )

      // Table of contents placeholder
      paragraphs.push(
        new Paragraph({
          text: "Table of Contents",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200, before: 200 },
        }),
      )

      sections.forEach((section, index) => {
        paragraphs.push(
          new Paragraph({
            text: `${index + 1}. ${section.title}`,
            spacing: { after: 100 },
            indent: { left: 200 },
          }),
        )
      })

      // Page break
      paragraphs.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        }),
      )

      // Content sections
      sections.forEach((section) => {
        paragraphs.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          }),
        )

        if (section.content) {
          const lines = section.content.split("\n").filter((line) => line.trim())
          lines.forEach((line) => {
            paragraphs.push(
              new Paragraph({
                text: line,
                spacing: { after: 100 },
                alignment: AlignmentType.JUSTIFIED,
              }),
            )
          })
        }

        paragraphs.push(
          new Paragraph({
            text: "",
            spacing: { after: 200 },
          }),
        )
      })

      const doc = new Document({
        sections: [
          {
            children: paragraphs,
            properties: {
              page: {
                margins: {
                  top: 1000,
                  right: 1000,
                  bottom: 1000,
                  left: 1000,
                },
              },
            },
          },
        ],
      })

      const buffer = await Packer.toBuffer(doc)
      return buffer
    } catch (error) {
      console.error("Error exporting to DOCX:", error)
      throw new Error("Failed to generate Word document")
    }
  }

  async exportToPptx(
    projectTitle: string,
    sections: DocumentSection[],
    options: ExportOptions = { filename: "presentation.pptx" },
  ): Promise<ArrayBuffer> {
    try {
      const prs = new PptxGenJS()

      // Set master slide dimensions
      prs.defineLayout({ name: "MASTER1", width: 10, height: 7.5 })

      // Define color scheme
      const colors = {
        primary: "2563EB", // Blue
        dark: "1F2937", // Dark gray
        light: "F3F4F6", // Light gray
        accent: "F97316", // Orange
        text: "111827", // Nearly black
        textLight: "6B7280", // Medium gray
      }

      // Title slide
      const titleSlide = prs.addSlide()
      titleSlide.background = { color: colors.primary }

      titleSlide.addText(projectTitle, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 54,
        bold: true,
        color: "FFFFFF",
        align: "center",
      })

      titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: 0.5,
        y: 4.2,
        w: 9,
        h: 0.5,
        fontSize: 16,
        color: colors.light,
        align: "center",
      })

      // Content slides
      sections.forEach((section, index) => {
        const slide = prs.addSlide()
        slide.background = { color: "FFFFFF" }

        // Slide header with accent bar
        slide.addShape(prs.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 1.2,
          fill: { color: colors.primary },
        })

        slide.addText(section.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.8,
          fontSize: 40,
          bold: true,
          color: "FFFFFF",
          align: "left",
        })

        // Slide number
        slide.addText(`${index + 1}`, {
          x: 9.2,
          y: 0.3,
          w: 0.5,
          h: 0.8,
          fontSize: 14,
          color: colors.light,
          align: "right",
        })

        // Content area
        if (section.content) {
          slide.addText(section.content, {
            x: 0.5,
            y: 1.5,
            w: 9,
            h: 5.5,
            fontSize: 18,
            color: colors.text,
            align: "left",
            valign: "top",
            wrap: true,
          })
        }

        // Footer
        slide.addText("DocuMind", {
          x: 0.5,
          y: 7,
          w: 9,
          h: 0.4,
          fontSize: 10,
          color: colors.textLight,
          align: "center",
        })
      })

      const buffer = await prs.write({ outputType: "arraybuffer" })
      return buffer
    } catch (error) {
      console.error("Error exporting to PPTX:", error)
      throw new Error("Failed to generate PowerPoint presentation")
    }
  }

  // Generate mock document for testing
  generateMockDocx(projectTitle: string): Buffer {
    const paragraphs = [
      new Paragraph({
        text: projectTitle,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "[Mock Document] This is a preview of your exported document.",
        spacing: { after: 200 },
        color: "999999",
      }),
      new Paragraph({
        text: "Section 1",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "This section contains mock content for demonstration purposes.",
        spacing: { after: 100 },
      }),
    ]

    const doc = new Document({
      sections: [{ children: paragraphs }],
    })

    return Packer.toBuffer(doc) as unknown as Buffer
  }

  // Generate mock PowerPoint for testing
  generateMockPptx(projectTitle: string): ArrayBuffer {
    const prs = new PptxGenJS()
    const slide = prs.addSlide()
    slide.background = { color: "FFFFFF" }
    slide.addText(projectTitle, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1,
      fontSize: 44,
      bold: true,
    })
    slide.addText("[Mock Presentation] Preview of your exported slide deck", {
      x: 0.5,
      y: 3.2,
      w: 9,
      h: 1,
      fontSize: 18,
      color: "999999",
    })
    return prs.write({ outputType: "arraybuffer" })
  }
}

export const exportService = new ExportService()
