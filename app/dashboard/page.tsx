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
import LayananDataDashboard from "./_views/LayananDataDashboard";
// import AnggotaView from "./_views/AnggotaView";

// IMPORT ACTIONS
import {
  getDashboardStats,
  getTimelineData,
  getAttentionItems,
  getRisetStats,
  getSecretaryDashboardData,
  getTreasurerDashboardData,
  getLayananDataStats,
} from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Auth Check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // Ambil Role User & DIVISI
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
  // Normalisasi nama divisi (handle null & lowercase)
  const divisionName = userProfile.division?.divisionName.toLowerCase() || "";

  // LOGIC KETUA
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

  // LOGIC KOORDINATOR
  if (roleName === "Koordinator") {
    // KOORDINATOR RISET & DATA
    if (divisionName.includes("riset") || divisionName.includes("infografis")) {
      if (!userProfile.divisionId)
        return <div>Error: Divisi belum di-assign.</div>;

      // Ambil statistik khusus Riset
      const risetData = await getRisetStats(userProfile.divisionId);

      return <KoordinatorRisetView user={userProfile} data={risetData} />;
    }
    if (divisionName.includes("layanan") || divisionName.includes("data")) {
      if (!userProfile.divisionId)
        return <div>Error: Divisi belum di-assign.</div>;

      // Ambil statistik khusus Layanan data
      const layananData = await getLayananDataStats();
      return <LayananDataDashboard user={userProfile} data={layananData} />;
    }

    //KOORDINATOR LAIN (Media, SDM, dll - Coming Soon)
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

  // LOGIC ANGGOTA / LAINNYA
  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">Dashboard Anggota</h2>
      <p>Selamat datang, {userProfile.name}. Silakan cek menu di samping.</p>
    </div>
  );
  // return <AnggotaView user={userProfile} />;
}
