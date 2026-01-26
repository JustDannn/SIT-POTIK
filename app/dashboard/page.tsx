// src/app/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Import Views
import KetuaView from "./_views/KetuaView";
// import AnggotaView from "./_views/AnggotaView";
// ... import view lain

// Import Server Actions Baru
import {
  getDashboardStats,
  getTimelineData,
  getAttentionItems,
} from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // 2. Ambil Role User
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true },
  });

  if (!userProfile?.role) return <div>Error: Role missing</div>;

  const roleName = userProfile.role.roleName;

  // 3. LOGIC FETCHING BERDASARKAN ROLE
  // Kita fetch data KHUSUS buat Ketua di sini
  if (roleName === "Ketua") {
    // Jalankan 3 fungsi query secara paralel biar ngebut
    const [stats, timelineData, attentionData] = await Promise.all([
      getDashboardStats(),
      getTimelineData(),
      getAttentionItems(),
    ]);

    // Lempar datanya ke View
    return (
      <KetuaView
        user={userProfile}
        stats={stats}
        timeline={timelineData}
        attention={attentionData}
      />
    );
  }

  // ... Logic role lain (Anggota, Koordinator, dll)
  //   return <AnggotaView user={userProfile} />;
}
