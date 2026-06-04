import { prisma } from "@packages/prisma"

// app/api/check-email/route.ts
export async function POST(req: Request) {
  const { email } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  return Response.json({ exists: !!user })
}