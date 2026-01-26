"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function register(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  // 1. Validasi Token (Hardcode di env dulu)
  if (token !== process.env.REGISTRATION_TOKEN) {
    // Balikin error (Idealnya pake state, tp redirect error dulu gpp)
    return redirect("/login/register?error=invalid_token");
  }

  // 2. Validasi Domain Email (Opsional)
  if (!email.endsWith("@student.telkomuniversity.ac.id")) {
    return redirect("/login/register?error=invalid_domain");
  }

  // 3. Create User di Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Ini bakal dibaca sama Trigger SQL tadi
      },
    },
  });

  if (error) {
    console.error(error);
    return redirect("/login/register?error=signup_failed");
  }

  // Sukses
  redirect("/dashboard?welcome=true");
}
