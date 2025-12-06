# DocuMind - API Reference

## Authentication Endpoints

### Register User
\`\`\`
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "user@example.com" }
}

Response 400:
{ "message": "Email already exists" }
\`\`\`

### Login User
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "user@example.com" }
}

Response 401:
{ "message": "Invalid email or password" }
\`\`\`

## Project Endpoints

### List Projects
\`\`\`
GET /api/projects
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "proj-uuid",
    "user_id": "user-uuid",
    "topic": "Business Plan",
    "document_type": "docx",
    "created_at": "2025-01-15T10:30:00Z"
  }
]

Response 401:
{ "message": "Unauthorized" }
\`\`\`

### Create Project
\`\`\`
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "Q4 Marketing Strategy",
  "document_type": "pptx"
}

Response 201:
{
  "id": "proj-uuid",
  "user_id": "user-uuid",
  "topic": "Q4 Marketing Strategy",
  "document_type": "pptx",
  "created_at": "2025-01-15T10:30:00Z"
}
\`\`\`

### Get Project
\`\`\`
GET /api/projects/{projectId}
Authorization: Bearer {token}

Response 200:
{
  "id": "proj-uuid",
  "user_id": "user-uuid",
  "topic": "Business Plan",
  "document_type": "docx",
  "created_at": "2025-01-15T10:30:00Z"
}

Response 404:
{ "message": "Project not found" }
\`\`\`

## Section Endpoints

### Get Project Outline
\`\`\`
GET /api/projects/{projectId}/outline
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "section-uuid",
    "project_id": "proj-uuid",
    "section_index": 1,
    "title": "Executive Summary",
    "generated_content": null,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
\`\`\`

## Content Generation Endpoints

### Suggest Outline
\`\`\`
POST /api/generate/suggest-outline
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "proj-uuid",
  "topic": "Business Plan",
  "documentType": "docx"
}

Response 200:
{
  "sections": [
    "Executive Summary",
    "Market Analysis",
    "Financial Projections",
    "Risk Assessment"
  ]
}

Response 429:
{ "message": "Rate limit exceeded. Please try again later." }

Response 500:
{ "message": "Failed to generate outline" }
\`\`\`

### Generate Section Content
\`\`\`
POST /api/generate/section
Authorization: Bearer {token}
Content-Type: application/json

{
  "sectionId": "section-uuid",
  "sectionTitle": "Market Analysis",
  "projectTopic": "Business Plan"
}

Response 200:
{
  "content": "The market analysis reveals opportunities in..."
}

Response 429:
{ "message": "Rate limit exceeded" }

Response 500:
{ "message": "Failed to generate content" }
\`\`\`

### Refine Content
\`\`\`
POST /api/generate/refine
Authorization: Bearer {token}
Content-Type: application/json

{
  "sectionId": "section-uuid",
  "currentContent": "Existing content here...",
  "refinementPrompt": "Make this more formal and add statistics"
}

Response 200:
{
  "content": "The refined content..."
}

Response 429:
{ "message": "Rate limit exceeded" }

Response 500:
{ "message": "Failed to refine content" }
\`\`\`

## Refinement & Feedback Endpoints

### Get Refinements
\`\`\`
GET /api/sections/{sectionId}/refinements
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "refine-uuid",
    "section_id": "section-uuid",
    "prompt": "Make more formal",
    "refined_content": "The refined content...",
    "likes": 1,
    "dislikes": 0,
    "created_at": "2025-01-15T11:00:00Z"
  }
]
\`\`\`

### Like Refinement
\`\`\`
POST /api/refinements/{refinementId}/like
Authorization: Bearer {token}
Content-Type: application/json

{
  "liked": true
}

Response 200:
{ "message": "Like updated" }
\`\`\`

### Dislike Refinement
\`\`\`
POST /api/refinements/{refinementId}/dislike
Authorization: Bearer {token}
Content-Type: application/json

{
  "disliked": true
}

Response 200:
{ "message": "Dislike updated" }
\`\`\`

### Add Comment
\`\`\`
POST /api/refinements/{refinementId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "This version is better because..."
}

Response 200:
{
  "id": "comment-uuid",
  "refinement_id": "refine-uuid",
  "content": "This version is better...",
  "created_at": "2025-01-15T11:05:00Z"
}
\`\`\`

### Get Comments
\`\`\`
GET /api/refinements/{refinementId}/comments
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "comment-uuid",
    "refinement_id": "refine-uuid",
    "content": "This version is better...",
    "created_at": "2025-01-15T11:05:00Z"
  }
]
\`\`\`

## Export Endpoints

### Export Document
\`\`\`
POST /api/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "proj-uuid"
}

Response 200:
[Binary file content]
Headers:
  Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Content-Disposition: attachment; filename="document.docx"

Response 404:
{ "message": "Project not found" }

Response 500:
{ "message": "Error exporting document" }
\`\`\`

## Health & Verification Endpoints

### Health Check
\`\`\`
GET /api/health

Response 200:
{ "status": "ok" }
\`\`\`

### Verify Token
\`\`\`
POST /api/auth/verify
Authorization: Bearer {token}

Response 200:
{ "valid": true, "user": { "id": "uuid", "email": "user@example.com" } }

Response 401:
{ "valid": false, "message": "Invalid token" }
\`\`\`

## Error Responses

All error responses follow this format:

\`\`\`json
{
  "message": "Human-readable error message"
}
\`\`\`

### Common Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `404 Not Found`: Resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Rate Limiting Headers

All responses include:
\`\`\`
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642254000
\`\`\`

## Request Headers

All protected endpoints require:

\`\`\`
Authorization: Bearer {jwt_token}
\`\`\`

Recommended headers for all requests:

\`\`\`
Content-Type: application/json
Accept: application/json
