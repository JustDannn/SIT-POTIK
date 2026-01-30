import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// --- IMPORT VIEWS ---
import KetuaView from "./_views/KetuaView";
import SecretaryDashboard from "./_views/SecretaryDashboard";
import KoordinatorRisetView from "./_views/KoordinatorRisetView";
import TreasurerDashboard from "./_views/TreasurerDashboard";
// import AnggotaView from "./_views/AnggotaView";

// --- IMPORT ACTIONS ---
import {
  getDashboardStats,
  getTimelineData,
  getAttentionItems,
  getRisetStats,
  getSecretaryDashboardData,
  getTreasurerDashboardData,
} from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // 2. Ambil Role User & DIVISI (PENTING!)
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: {
      role: true,
      division: true,
    },
  });

  if (!userProfile?.role)
    return <div className="p-8">Error: Role missing. Hubungi Admin.</div>;

  const roleName = userProfile.role.roleName;
  // Normalisasi nama divisi biar aman (handle null & lowercase)
  const divisionName = userProfile.division?.divisionName.toLowerCase() || "";

  // ============================================================
  // 3. LOGIC KETUA
  // ============================================================
  if (roleName === "Ketua") {
    // Jalankan 3 fungsi query secara paralel biar ngebut
    const [stats, timelineData, attentionData] = await Promise.all([
      getDashboardStats(),
      getTimelineData(),
      getAttentionItems(),
    ]);

    return (
      <KetuaView
        user={userProfile}
        stats={stats}
        timeline={timelineData}
        attention={attentionData}
      />
    );
  }

  // ============================================================
  // 4. LOGIC KOORDINATOR
  // ============================================================
  if (roleName === "Koordinator") {
    // A. KOORDINATOR RISET & DATA
    // Pake .includes biar fleksibel (misal di DB tulisannya "Divisi Riset" tetep kena)
    if (divisionName.includes("riset") || divisionName.includes("data")) {
      // Pastikan divisionId ada
      if (!userProfile.divisionId)
        return <div>Error: Divisi belum di-assign.</div>;

      // Ambil statistik khusus Riset
      const risetData = await getRisetStats(userProfile.divisionId);

      return <KoordinatorRisetView user={userProfile} data={risetData} />;
    }

    // B. KOORDINATOR LAIN (Media, SDM, dll - Coming Soon)
    return (
      <div className="p-10 text-center border border-dashed rounded-xl m-8">
        <h2 className="text-xl font-bold text-gray-700">
          Dashboard Koordinator {userProfile.division?.divisionName}
        </h2>
        <p className="text-gray-500 mt-2">
          Fitur spesifik divisi ini sedang dalam pengembangan 🚧
        </p>
      </div>
    );
  }
  if (roleName === "Sekretaris") {
    const dashboardData = await getSecretaryDashboardData();
    return <SecretaryDashboard data={dashboardData} user={userProfile} />;
  }
  if (roleName === "Bendahara") {
    const dashboardData = await getTreasurerDashboardData();
    return <TreasurerDashboard data={dashboardData} user={userProfile} />;
  }
  // ============================================================
  // 5. LOGIC ANGGOTA / LAINNYA
  // ============================================================
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">Dashboard Anggota</h2>
      <p>Selamat datang, {userProfile.name}. Silakan cek menu di samping.</p>
    </div>
  );
  // return <AnggotaView user={userProfile} />;
}
