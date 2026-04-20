
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refresh-token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    return {
      id: (decoded as any).id,
      role: (decoded as any).role,
    };

  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}