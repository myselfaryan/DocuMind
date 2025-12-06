import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ valid: false }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = await verifyToken(token)

    if (!payload) {
      return Response.json({ valid: false }, { status: 401 })
    }

    return Response.json({ valid: true, userId: payload.userId })
  } catch (error) {
    return Response.json({ valid: false }, { status: 401 })
  }
}
