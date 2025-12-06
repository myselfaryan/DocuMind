# AI Service Implementation Guide

## Overview

DocuMind uses a centralized AI service layer that provides content generation, refinement, rate limiting, and graceful fallback modes.

## Core Components

### 1. AIService (`lib/services/ai-service.ts`)

**Features:**
- Unified interface for all AI operations
- Rate limiting: 10 requests per minute per user
- Automatic retry with exponential backoff (up to 3 attempts)
- Mock mode for testing and demos
- Comprehensive error handling

**Usage:**

\`\`\`typescript
import { aiService } from '@/lib/services/ai-service'

// Generate content with user tracking
const content = await aiService.generateContent(
  {
    prompt: 'Your prompt here',
    maxTokens: 2000,
    temperature: 0.7,
  },
  userId // Optional: for rate limiting
)

// Check rate limit status
const status = aiService.getRateLimitStatus(userId)
console.log(status.remaining) // requests left in window
console.log(status.resetIn) // ms until reset

// Toggle mock mode
aiService.setMockMode(true) // Enable for testing
\`\`\`

**Error Handling:**

The service automatically handles:
- API rate limits → Informs user to retry later
- Authentication failures → Clear error message
- Context length exceeded → Suggests shorter input
- Model unavailable → Directs to support
- Network failures → Retries with backoff

### 2. ExportService (`lib/services/export-service.ts`)

**Features:**
- Enhanced DOCX export with table of contents
- Professional PPTX export with styling and branding
- Mock document generation for testing
- Proper formatting and page layouts

**Usage:**

\`\`\`typescript
import { exportService } from '@/lib/services/export-service'

// Export to Word
const docxBuffer = await exportService.exportToDocx(
  'Project Title',
  [
    { title: 'Section 1', content: 'Content here' },
    { title: 'Section 2', content: 'More content' },
  ],
  { filename: 'document.docx' }
)

// Export to PowerPoint
const pptxBuffer = await exportService.exportToPptx(
  'Presentation Title',
  sections,
  { filename: 'presentation.pptx' }
)

// Mock export for testing
const mockDocx = exportService.generateMockDocx('Title')
const mockPptx = exportService.generateMockPptx('Title')
\`\`\`

## Environment Configuration

### Required Variables

- `OPENAI_API_KEY` - For real AI generation (automatically handled by Vercel AI Gateway)
- `NODE_ENV` - Automatically set by deployment

### Mock Mode Activation

Mock mode activates automatically when:
- `NODE_ENV === "test"`
- No valid API key is available

To force mock mode for testing:

\`\`\`typescript
aiService.setMockMode(true)
\`\`\`

## API Endpoints

### Generate Section Content

**POST** `/api/generate/section`

\`\`\`json
{
  "sectionId": "uuid",
  "sectionTitle": "Section Title",
  "projectTopic": "Topic Description"
}
\`\`\`

### Refine Content

**POST** `/api/generate/refine`

\`\`\`json
{
  "sectionId": "uuid",
  "currentContent": "Content to refine",
  "refinementPrompt": "How to refine it"
}
\`\`\`

### Generate Outline

**POST** `/api/generate/suggest-outline`

\`\`\`json
{
  "projectId": "uuid",
  "documentType": "docx" | "pptx"
}
\`\`\`

### Export Document

**POST** `/api/export`

\`\`\`json
{
  "projectId": "uuid"
}
\`\`\`

### Test AI Service

**POST** `/api/test-ai`

\`\`\`json
{
  "testType": "text" | "outline" | "refinement",
  "useMock": true | false
}
\`\`\`

### Health Check

**GET** `/api/health`

## Rate Limiting

- **Limit**: 10 requests per minute per user
- **Window**: 60 seconds
- **Reset**: Automatic at window end
- **Headers**: Check `X-RateLimit-Remaining` and `X-RateLimit-Reset`

### Response When Rate Limited

\`\`\`json
{
  "message": "Rate limit exceeded. Please try again later."
}
\`\`\`

## Error Handling Patterns

### In Route Handlers

\`\`\`typescript
try {
  const content = await aiService.generateContent(
    { prompt: '...' },
    userId
  )
  return Response.json({ content })
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return Response.json({ message }, { status: 500 })
}
\`\`\`

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Rate limit exceeded | Too many requests | Wait and retry |
| Authentication failed | Invalid API config | Check environment variables |
| Context length exceeded | Input too long | Use shorter prompts |
| Model not available | Service issue | Contact support |

## Testing

### Using Mock Mode

\`\`\`typescript
// In tests or development
aiService.setMockMode(true)

const content = await aiService.generateContent({
  prompt: 'Any prompt...'
})
// Returns mock response
\`\`\`

### Test Endpoint

Use `/api/test-ai` to verify functionality:

\`\`\`bash
curl -X POST http://localhost:3000/api/test-ai \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testType": "text", "useMock": true}'
\`\`\`

## Performance Optimization

1. **Caching**: Consider implementing Redis caching for frequently requested outlines
2. **Batch Processing**: Group multiple refinement requests
3. **Streaming**: Use `streamText` for long content in real-time updates
4. **Database Indexing**: Ensure database indexes on user_id and project_id

## Future Enhancements

- Redis-based distributed rate limiting
- Provider fallback (GPT-4 → Claude → Gemini)
- Streaming responses for real-time generation
- Cost tracking and usage analytics
- User-specific rate limit tiers
