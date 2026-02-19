import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Actions & Views
import { getAllProkers } from "./actions";
import KetuaProkerView from "./_views/KetuaProkerView";
import KoordinatorProkerView from "./_views/KoordinatorProkerView";

export default async function ProkerPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Auth Check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

  if (!userProfile?.role) return <div>Unauthorized</div>;
  const roleName = userProfile.role.roleName;

  // Ambil data proker (sudah terfilter otomatis di server action berdasarkan role)
  const prokersData = await getAllProkers();
  const prokers = prokersData.map((p) => ({
    ...p,
    status: p.status ?? "created",
  }));

  // View KETUA (Melihat Semua)
  if (roleName === "Ketua") {
    return (
      <KetuaProkerView
        data={prokers as any}
        initialView={params.view === "gantt" ? "gantt" : "list"}
      />
    );
  }

  // View KOORDINATOR / ANGGOTA (Melihat Divisi Sendiri)
  // Mereka bisa melihat tombol "Buat Proker Baru" di view ini.
  if (roleName === "Koordinator" || roleName === "Anggota") {
    return <KoordinatorProkerView data={prokers as any} user={userProfile} />;
  }

  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-400">
        Role tidak dikenali: {roleName}
      </h2>
    </div>
  );
}
