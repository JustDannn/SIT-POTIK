import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SessionPayload {
  userId: string;
  expires: Date;
  [key: string]: unknown;
}

const secretKey = process.env.JWT_SECRET || "rahasia-negara-jangan-bocor-123";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Login bertahan 1 hari
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
  return payload as SessionPayload;
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 hari
  const session = await encrypt({ userId, expires });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const session = await decrypt(sessionCookie);
    if (!session?.userId) return null;

    // Ambil data user dari database lokal pakai Drizzle
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      with: {
        role: true,
        division: true,
      },
    });

    return user || null;
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
