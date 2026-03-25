"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db"; // Sesuaikan path Drizzle instance lu
import { users, registrationTokens } from "@/db/schema"; // Import tabel token
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

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

  // Register ke Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error || !data.user) {
    console.error("Auth Error:", error);
    return redirect("/login/register?error=signup_failed");
  }

  // Masukin ke tabel public `users` dan tandain token terpakai
  try {
    await db.insert(users).values({
      id: data.user.id,
      name: fullName,
      email: email,
      status: "active",
      roleId: tokenRecord.roleId, // Role otomatis dari token
      divisionId: tokenRecord.divisionId, // Divisi otomatis dari token
    });

    await db
      .update(registrationTokens)
      .set({ isUsed: true })
      .where(eq(registrationTokens.id, tokenRecord.id));
  } catch (dbError) {
    console.error("DB Insert Error:", dbError);
    return redirect("/login/register?error=db_error");
  }

  // Sukses!
  redirect("/dashboard?welcome=true");
}
