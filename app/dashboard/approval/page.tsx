import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getApprovals, getMySubmissions } from "./actions";
import KetuaApprovalView from "./_views/KetuaApprovalView";
import KoordinatorApprovalView from "./_views/KoordinatorApprovalView";

export default async function ApprovalPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true },
  });

  if (!userProfile?.role) return <div>Unauthorized: Role not found</div>;

  const roleName = userProfile.role.roleName;

  if (roleName === "Ketua") {
    const approvalsData = await getApprovals();
    return <KetuaApprovalView data={approvalsData} />;
  }

  // Koordinator & Anggota: See their own submission statuses
  if (roleName === "Koordinator" || roleName === "Anggota") {
    const mySubmissions = await getMySubmissions(authUser.id);
    return (
      <KoordinatorApprovalView
        data={mySubmissions}
        userName={userProfile.name}
      />
    );
  }

  return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-gray-400">
        Halaman Laporan untuk {roleName} sedang dibangun
      </h2>
    </div>
  );
}
