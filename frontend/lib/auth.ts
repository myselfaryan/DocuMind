import { jwtVerify, SignJWT } from "jose"

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key-do-not-use-in-production")

export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET_KEY)
  return token
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY)
    const payload = verified.payload
    return { userId: (payload.userId || payload.user_id) as string }
  } catch (err) {
    return null
  }
}
