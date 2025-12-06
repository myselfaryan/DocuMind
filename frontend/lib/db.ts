import { neon } from "@neondatabase/serverless"

// This allows the app to build even if the database isn't connected yet.
export const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : ((async () => {
      throw new Error("DATABASE_URL is not set. Please add the Neon integration.")
    }) as unknown as ReturnType<typeof neon>)

export async function getUser(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return result[0]
}

export async function createUser(email: string, passwordHash: string) {
  const result = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email
  `
  return result[0]
}

export async function getUserById(userId: string) {
  const result = await sql`
    SELECT id, email, created_at FROM users WHERE id = ${userId}
  `
  return result[0]
}

export async function getProjects(userId: string) {
  return sql`
    SELECT * FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
}

export async function createProject(userId: string, documentType: "docx" | "pptx", topic: string) {
  const result = await sql`
    INSERT INTO projects (user_id, document_type, topic)
    VALUES (${userId}, ${documentType}, ${topic})
    RETURNING *
  `
  return result[0]
}

export async function getProject(projectId: string) {
  return sql`SELECT * FROM projects WHERE id = ${projectId}`
}

export async function getSections(projectId: string) {
  return sql`
    SELECT * FROM sections
    WHERE project_id = ${projectId}
    ORDER BY section_index ASC
  `
}

export async function createSection(projectId: string, sectionIndex: number, title: string) {
  const result = await sql`
    INSERT INTO sections (project_id, section_index, title)
    VALUES (${projectId}, ${sectionIndex}, ${title})
    RETURNING *
  `
  return result[0]
}

export async function updateSection(sectionId: string, generatedContent: string) {
  const result = await sql`
    UPDATE sections
    SET generated_content = ${generatedContent}, updated_at = NOW()
    WHERE id = ${sectionId}
    RETURNING *
  `
  return result[0]
}

export async function deleteProject(projectId: string) {
  return sql`DELETE FROM projects WHERE id = ${projectId}`
}

export async function createRefinement(sectionId: string, prompt: string, refinedContent: string) {
  const result = await sql`
    INSERT INTO refinements (section_id, prompt, refined_content)
    VALUES (${sectionId}, ${prompt}, ${refinedContent})
    RETURNING *
  `
  return result[0]
}

export async function getRefinements(sectionId: string) {
  return sql`
    SELECT * FROM refinements
    WHERE section_id = ${sectionId}
    ORDER BY created_at DESC
  `
}

export async function updateRefinementLikes(refinementId: string, likes: number) {
  const result = await sql`
    UPDATE refinements
    SET likes = ${likes}
    WHERE id = ${refinementId}
    RETURNING *
  `
  return result[0]
}

export async function updateRefinementDislikes(refinementId: string, dislikes: number) {
  const result = await sql`
    UPDATE refinements
    SET dislikes = ${dislikes}
    WHERE id = ${refinementId}
    RETURNING *
  `
  return result[0]
}

export async function createComment(refinementId: string, content: string) {
  const result = await sql`
    INSERT INTO comments (refinement_id, content)
    VALUES (${refinementId}, ${content})
    RETURNING *
  `
  return result[0]
}

export async function getComments(refinementId: string) {
  return sql`
    SELECT * FROM comments
    WHERE refinement_id = ${refinementId}
    ORDER BY created_at ASC
  `
}
