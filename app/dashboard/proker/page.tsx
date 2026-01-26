import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Actions & Views
import { getAllProkers } from "./actions";
import KetuaProkerView from "./_views/KetuaProkerView";

export default async function ProkerPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // 2. Ambil Role
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true },
  });

  if (!userProfile?.role) return <div>Unauthorized</div>;
  const roleName = userProfile.role.roleName;

  // 3. Logic Switch View
  // Kalau Ketua, kita kasih data semua proker
  if (roleName === "Ketua") {
    const prokers = await getAllProkers();
    return <KetuaProkerView data={prokers} />;
  }

  // TODO: Nanti buat view untuk Anggota/Koordinator di sini
  // if (roleName === 'Koordinator') return <KoordinatorProkerView ... />

  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-400">
        Tampilan Proker untuk {roleName} belum dibuat 🙏
      </h2>
    </div>
  );
}
