"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  if (token !== process.env.REGISTRATION_TOKEN) {
    return redirect("/login/register?error=invalid_token");
  }

  if (!email.endsWith("@student.telkomuniversity.ac.id")) {
    return redirect("/login/register?error=invalid_domain");
  }
  const defaultRole = await db.query.roles.findFirst({
    where: eq(roles.roleName, "Anggota"),
  });
  if (!defaultRole) {
    console.error("Role 'Anggota' tidak ditemukan di database!");
    return redirect("/login/register?error=system_error_no_role");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    console.error("Auth Error:", error);
    return redirect("/login/register?error=signup_failed");
  }

  if (!data.user) {
    return redirect("/login/register?error=no_user_created");
  }
  try {
    await db.insert(users).values({
      id: data.user.id,
      name: fullName,
      email: email,
      status: "active",
      roleId: defaultRole.id,
    });
  } catch (dbError) {
    console.error("DB Insert Error:", dbError);
    return redirect("/login/register?error=db_error");
  }

  // Sukses!
  redirect("/dashboard?welcome=true");
}
