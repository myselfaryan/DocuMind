# DocuMind - Architecture Guide

## System Overview

DocuMind is a full-stack Next.js application that uses AI to generate, refine, and export professional business documents. The architecture separates concerns into frontend (React), backend (API routes), services layer, and database.

## Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Lucide icons

**Backend:**
- Next.js API Routes
- TypeScript
- Node.js

**AI/ML:**
- Vercel AI SDK with Gemini 2.0 Flash
- @ai-sdk/google provider

**Database:**
- Neon (PostgreSQL)
- SQL queries via @neondatabase/serverless

**Export:**
- docx library (DOCX generation)
- pptxgenjs (PPTX generation)

**Authentication:**
- JWT tokens (jose library)
- bcryptjs password hashing
- Cookie-based session management

## Directory Structure

\`\`\`
docgenai/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── generate/       # AI content generation
│   │   ├── projects/       # Project management
│   │   ├── sections/       # Section/slide operations
│   │   ├── refinements/    # Refinement feedback
│   │   ├── export/         # Document export
│   │   └── health/         # Health checks
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Main dashboard
│   ├── editor/             # Document editor
│   ├── setup/              # Project setup/outline
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── export-button.tsx   # Export functionality
│   ├── section-editor.tsx  # Section editing
│   ├── refinement-history.tsx # Refinement UI
│   └── ...
├── lib/
│   ├── services/
│   │   ├── ai-service.ts   # AI generation logic
│   │   └── export-service.ts # Export functionality
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Database queries
│   └── utils.ts            # Helper functions
├── hooks/
│   ├── use-toast.ts        # Toast notifications
│   └── use-mobile.ts       # Mobile detection
├── docs/
│   ├── ARCHITECTURE.md     # This file
│   ├── API.md              # API documentation
│   ├── DATABASE.md         # Database schema
│   └── DEPLOYMENT.md       # Deployment guide
└── scripts/
    └── 01-init-schema.sql  # Database initialization
\`\`\`

## Data Flow

### Document Generation Flow

1. **User creates project** (Dashboard)
   - Specifies topic and document type
   - Project stored in database

2. **Setup outline** (Setup Page)
   - User enters main topic
   - AI suggests section/slide titles
   - User can accept, edit, or regenerate

3. **Generate sections** (Editor)
   - For each section, user clicks "Generate"
   - AI Service creates content based on section title
   - Content saved to database

4. **Refine content** (Editor)
   - User provides refinement prompt
   - AI refines existing content
   - Refinement saved to history
   - User can apply, compare, or create more variations

5. **Export document** (Editor)
   - User clicks "Export as DOCX/PPTX"
   - All sections fetched from database
   - Export Service formats and generates file
   - Browser downloads file

### Authentication Flow

1. **Register/Login** (Auth Pages)
   - Credentials sent to `/api/auth/register` or `/api/auth/login`
   - Password hashed with bcryptjs
   - JWT token created and returned

2. **Token storage** (Client)
   - JWT stored in localStorage
   - Sent with every API request in Authorization header

3. **Token verification** (API Routes)
   - Each route verifies token signature and expiration
   - User ID extracted from token payload
   - Used to scope data access

4. **Protected pages** (Components)
   - `<ProtectedRoute>` wrapper checks for valid token
   - Redirects to login if token missing/invalid

## Service Layer

### AIService (`lib/services/ai-service.ts`)

Provides unified interface for AI operations:

- **generateContent()**: Generate section content
- **generateOutline()**: Suggest document structure
- **refineContent()**: Improve existing content
- **callAI()**: Low-level API call handler
- **extractJSON()**: Parse structured responses
- **setMockMode()**: Enable testing mode

Features:
- Rate limiting (10 requests/minute per user)
- Automatic retry with exponential backoff
- Error handling and logging
- Mock mode for testing

### ExportService (`lib/services/export-service.ts`)

Handles document generation:

- **exportToDocx()**: Generate Word documents
- **exportToPptx()**: Generate PowerPoint presentations
- **generateMockDocx()**: Test document generation
- **generateMockPptx()**: Test presentation generation

Features:
- Professional formatting
- Brand styling and colors
- Table of contents generation
- Page breaks and layouts

## Database Schema

### Tables

**users**
- `id` (UUID): Primary key
- `email` (VARCHAR): Unique email address
- `password_hash` (VARCHAR): Hashed password
- `created_at` (TIMESTAMP): Account creation date

**projects**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `document_type` (VARCHAR): 'docx' or 'pptx'
- `topic` (VARCHAR): Main project topic
- `created_at`, `updated_at` (TIMESTAMP)

**sections**
- `id` (UUID): Primary key
- `project_id` (UUID): Foreign key to projects
- `section_index` (INT): Order in document
- `title` (VARCHAR): Section/slide title
- `generated_content` (TEXT): AI-generated content
- `created_at`, `updated_at` (TIMESTAMP)

**refinements**
- `id` (UUID): Primary key
- `section_id` (UUID): Foreign key to sections
- `prompt` (VARCHAR): Refinement instruction
- `refined_content` (TEXT): Refined content
- `likes` (INT): Like count
- `dislikes` (INT): Dislike count
- `created_at` (TIMESTAMP)

**comments**
- `id` (UUID): Primary key
- `refinement_id` (UUID): Foreign key to refinements
- `content` (TEXT): Comment text
- `created_at` (TIMESTAMP)

### Indexes

- `idx_projects_user_id`: Fast project lookup by user
- `idx_sections_project_id`: Fast section lookup by project
- `idx_refinements_section_id`: Fast refinement lookup by section
- `idx_comments_refinement_id`: Fast comment lookup by refinement

## API Endpoint Structure

All endpoints follow RESTful conventions with proper HTTP methods and status codes:

- **Authentication**: POST methods, 200/401/400 responses
- **Create**: POST methods, 201 response
- **Read**: GET methods, 200/404 responses
- **Update**: PUT/PATCH methods, 200/404 responses
- **Delete**: DELETE methods, 204/404 responses

Authentication: All protected endpoints require `Authorization: Bearer {token}` header.

## Error Handling Strategy

### API Level
- Try/catch blocks wrap async operations
- Consistent error response format: `{ message: string }`
- Proper HTTP status codes (400, 401, 404, 500)
- Detailed console logging with `[v0]` prefix

### Service Level
- AI Service retries with backoff
- Clear error messages for user-facing issues
- Mock mode fallback for testing
- Rate limit graceful handling

### Client Level
- Toast notifications for errors
- Automatic redirects for auth failures
- Fallback UI for loading states
- User-friendly error messages

## Performance Considerations

1. **Database Queries**
   - Indexed foreign keys for fast joins
   - ORDER BY clauses for consistent ordering
   - Parameterized queries prevent SQL injection

2. **API Efficiency**
   - Single fetch per operation where possible
   - Batch operations for bulk updates
   - Proper pagination support

3. **Caching Opportunities**
   - Client-side toast state management
   - React component memoization
   - Future: Redis for outline caching

4. **Rate Limiting**
   - Per-user rate limiting in AIService
   - Configurable limits (default: 10/minute)
   - Prevents API abuse and costs

## Security Considerations

1. **Authentication**
   - Secure JWT token generation and verification
   - Password hashing with bcryptjs
   - Token expiration and validation

2. **Data Access**
   - All queries scoped to authenticated user
   - No cross-user data leakage
   - Proper CASCADE delete for data cleanup

3. **Input Validation**
   - Type checking with TypeScript
   - Zod schemas for request validation
   - SQL parameterized queries

4. **Environment Variables**
   - Never commit secrets
   - Database URL and API keys configured via env
   - Development vs production separation

## Scalability Points

1. **Database**
   - Connection pooling via Neon
   - Index optimization for large datasets
   - Potential sharding by user_id

2. **AI API**
   - Rate limiting prevents runaway costs
   - Queue system for batch processing
   - Provider failover strategy

3. **Export**
   - File generation cached in memory
   - Consider S3 for large file storage
   - Async export for long-running jobs

4. **Frontend**
   - Code splitting by route
   - Image optimization
   - Component lazy loading

## Testing Strategy

1. **Unit Tests**
   - Test individual functions in services
   - Mock AI responses
   - Database query validation

2. **Integration Tests**
   - Full request/response cycle
   - Database operations
   - Auth flow verification

3. **E2E Tests**
   - User workflows across pages
   - Export verification
   - Error scenarios

## Monitoring and Logging

Current logging uses `console.log("[v0] ...")` for debugging. Consider:

1. **Structured Logging**
   - Use winston or pino
   - Log levels (debug, info, warn, error)
   - Timestamp and request ID tracking

2. **Monitoring**
   - Error rate tracking
   - Response time metrics
   - API usage analytics
   - Rate limit monitoring

3. **Alerts**
   - Database connection failures
   - API rate limit exceeded
   - Export service failures
