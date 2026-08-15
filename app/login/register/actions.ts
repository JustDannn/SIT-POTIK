"use server";

import { db } from "@/db";
import { users, registrationTokens } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/utils/session";

export async function signUp(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const tokenInput = formData.get("token") as string;

  // Validasi Domain Email
  if (!email.endsWith("@student.telkomuniversity.ac.id")) {
    return redirect("/login/register?error=invalid_domain");
  }

  // Cek Token di Database
  const tokenRecord = await db.query.registrationTokens.findFirst({
    where: eq(registrationTokens.token, tokenInput),
  });

  if (!tokenRecord) {
    return redirect("/login/register?error=invalid_token");
  }

  if (tokenRecord.isUsed) {
    return redirect("/login/register?error=token_used");
  }

  if (new Date() > tokenRecord.expiresAt) {
    return redirect("/login/register?error=token_expired");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return redirect("/login/register?error=signup_failed");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        name: fullName,
        email: email,
        password: hashedPassword,
        status: "active",
        roleId: tokenRecord.roleId,
        divisionId: tokenRecord.divisionId,
      })
      .returning({ id: users.id });

    await db
      .update(registrationTokens)
      .set({ isUsed: true })
      .where(eq(registrationTokens.id, tokenRecord.id));

    await createSession(newUser.id);
  } catch (dbError) {
    console.error("DB Insert Error:", dbError);
    return redirect("/login/register?error=db_error");
  }
  redirect("/dashboard?welcome=true");
}
