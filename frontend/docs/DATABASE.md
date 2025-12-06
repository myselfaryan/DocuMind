# DocuMind - Database Guide

## Setup

### Prerequisites

- Neon PostgreSQL database account
- Environment variable: `DATABASE_URL`

### Initialize Schema

The schema is initialized via the SQL script during first deployment:

\`\`\`bash
# Run via Vercel deployment or manually
psql $DATABASE_URL < scripts/01-init-schema.sql
\`\`\`

## Table Reference

### users

Stores user account information.

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Queries:**
- `getUser(email)` - Fetch user by email
- `createUser(email, passwordHash)` - Create new account
- `getUserById(userId)` - Fetch user by ID

### projects

Stores document projects.

\`\`\`sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('docx', 'pptx')),
  topic VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Queries:**
- `getProjects(userId)` - List user's projects
- `createProject(userId, type, topic)` - Create new project
- `getProject(projectId)` - Fetch single project
- `deleteProject(projectId)` - Delete project and cascade

### sections

Stores document sections or presentation slides.

\`\`\`sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_index INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  generated_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Queries:**
- `getSections(projectId)` - List sections in order
- `createSection(projectId, index, title)` - Add section
- `updateSection(sectionId, content)` - Save generated content

**Notes:**
- `section_index` determines display order
- `generated_content` is NULL until AI generates
- CASCADE delete removes refinements/comments

### refinements

Stores content refinement history.

\`\`\`sql
CREATE TABLE refinements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  prompt VARCHAR(512),
  refined_content TEXT,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Queries:**
- `getRefinements(sectionId)` - List refinements in reverse order
- `createRefinement(sectionId, prompt, content)` - Add refinement
- `updateRefinementLikes(refinementId, count)` - Update likes
- `updateRefinementDislikes(refinementId, count)` - Update dislikes

**Notes:**
- Each refinement is independent version
- User feedback (likes/dislikes) tracks preference
- No edit of existing refinements - only creation

### comments

Stores feedback comments on refinements.

\`\`\`sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refinement_id UUID NOT NULL REFERENCES refinements(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Queries:**
- `getComments(refinementId)` - List comments in order
- `createComment(refinementId, content)` - Add comment

## Indexes

Optimizations for common queries:

\`\`\`sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_refinements_section_id ON refinements(section_id);
CREATE INDEX idx_comments_refinement_id ON comments(refinement_id);
\`\`\`

These enable fast lookups without full table scans.

## Data Relationships

\`\`\`
users (1) --- (many) projects
              |
              +--- (many) sections
                    |
                    +--- (many) refinements
                          |
                          +--- (many) comments
\`\`\`

## Data Flow Examples

### Creating a New Document

1. User submits form with topic and type
2. `createProject()` → New row in `projects`
3. API calls `generateOutline()` with topic
4. AI returns section titles
5. For each title, `createSection()` → New rows in `sections`

### Generating Content

1. User clicks "Generate" on a section
2. `getSections()` retrieves all sections for context
3. AI generates content based on section title
4. `updateSection()` saves `generated_content`

### Refining Content

1. User enters refinement prompt
2. `getSections()` gets current content
3. AI refines the content
4. `createRefinement()` saves as new version
5. User rates refinement with like/dislike
6. `updateRefinementLikes()` or `updateRefinementDislikes()`

### User Deletes Project

1. `deleteProject()` runs DELETE on projects table
2. CASCADE automatically deletes:
   - All sections in project
   - All refinements in those sections
   - All comments on those refinements

## Performance Tips

1. **Always order by index when fetching lists**
   \`\`\`sql
   SELECT * FROM sections 
   WHERE project_id = $1 
   ORDER BY section_index ASC;
   \`\`\`

2. **Use indexes for WHERE clauses**
   - Indexed: `project_id`, `user_id`, `section_id`, `refinement_id`
   - Full table scans avoided

3. **Batch operations when possible**
   - Instead of multiple updates, combine when feasible
   - Reduces round trips to database

4. **Monitor query performance**
   - Neon dashboard shows slow queries
   - Add indexes for frequently filtered columns

## Backup Strategy

Neon provides:
- Daily automated backups
- Point-in-time recovery (1 month retention)
- Manual backup creation via dashboard

## Migration Strategy

When schema changes are needed:

1. Create migration script with both up and down
2. Test in development database first
3. Deploy to production with backwards compatibility
4. Monitor for issues before cleanup
5. Document changes in version control

Example:
\`\`\`sql
-- Up: Add new column
ALTER TABLE projects ADD COLUMN description TEXT;

-- Down: Revert
ALTER TABLE projects DROP COLUMN description;
