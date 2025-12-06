export const MOCK_DOCUMENTS = {
  business_proposal: {
    topic: "Q4 Business Expansion Strategy",
    sections: [
      {
        title: "Executive Summary",
        content:
          "This proposal outlines our comprehensive strategy for Q4 business expansion. We project a 35% growth in revenue through market penetration and strategic partnerships. Key initiatives include product line diversification and enhanced customer engagement programs.",
      },
      {
        title: "Market Analysis",
        content:
          "Current market trends indicate strong demand in our target segments. Competitors are focusing on price wars, while we maintain a premium positioning. Our analysis shows 45% year-over-year growth potential in the emerging markets we serve.",
      },
      {
        title: "Implementation Plan",
        content:
          "Phase 1 focuses on infrastructure upgrades and team expansion. Phase 2 involves market testing and customer acquisition campaigns. Phase 3 scales successful initiatives across all regions. Timeline: 90 days for full implementation.",
      },
    ],
  },
  marketing_presentation: {
    topic: "Spring Marketing Campaign 2025",
    sections: [
      { title: "Campaign Overview", content: "Multi-channel marketing initiative targeting millennials and Gen Z" },
      {
        title: "Social Media Strategy",
        content: "Focus on TikTok, Instagram, and LinkedIn with influencer partnerships",
      },
      { title: "Content Calendar", content: "Weekly posts, monthly webinars, quarterly brand events" },
      { title: "Budget Allocation", content: "40% digital, 30% influencer partnerships, 30% events" },
    ],
  },
}

export function generateMockOutline(documentType: string, count = 5): string[] {
  const docxOutlines = [
    "Executive Summary",
    "Market Analysis",
    "Product Overview",
    "Implementation Strategy",
    "Timeline & Milestones",
  ]

  const pptxOutlines = [
    "Title Slide",
    "Agenda",
    "Market Overview",
    "Product Offering",
    "Competitive Analysis",
    "Implementation Plan",
    "Timeline & ROI",
    "Q&A",
  ]

  const outlines = documentType === "docx" ? docxOutlines : pptxOutlines
  return outlines.slice(0, count)
}
