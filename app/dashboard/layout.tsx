import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/layout/sidebar";
import { db } from "@/db";
import { users, roles } from "@/db/schema"; // Pastikan path schema bener
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: {
      role: true,
    },
  });
  if (!userProfile || !userProfile.role) {
    return <div>Error: Role not found. Contact Admin.</div>;
  }
  const userData = {
    name: userProfile.name,
    email: userProfile.email,
    role: userProfile.role.roleName, // Contoh: "Ketua", "Anggota"
    avatarUrl: undefined, // Atau ambil dari kolom avatar kalau ada
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar Otomatis Menyesuaikan Role */}
      <Sidebar user={userData} />

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
