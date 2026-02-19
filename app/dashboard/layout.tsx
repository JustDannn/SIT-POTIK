import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/layout/sidebar";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthProvider } from "@/lib/context/AuthContext";

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
      division: true,
    },
  });

  if (!userProfile || !userProfile.role) {
    return (
      <div className="p-10 text-center">
        Error: User Profile / Role not found. Contact Admin.
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar Otomatis Menyesuaikan Role */}
      <Sidebar user={userProfile} />

      {/* Area Konten Utama */}
      <div className="flex-1 overflow-y-auto p-8">
        <AuthProvider>{children}</AuthProvider>
      </div>
    </div>
  );
}
