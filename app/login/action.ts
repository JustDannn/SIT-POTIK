"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/utils/session";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.password) {
    return redirect("/login?error=invalid_credentials");
  }
  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return redirect("/login?error=invalid_credentials");
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
