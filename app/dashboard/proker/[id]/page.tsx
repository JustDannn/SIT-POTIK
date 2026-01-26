import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getProkerDetail } from "../actions"; // Import action yang tadi kita buat
import ProkerDetailView from "../_views/ProkerDetailView";

export default async function ProkerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // 1. Auth Check (Standard)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Ambil ID dari URL
  const prokerId = parseInt(params.id);
  if (isNaN(prokerId)) notFound();

  // 3. Fetch Data Detail
  const prokerData = await getProkerDetail(prokerId);

  // 4. Kalau gak ketemu -> 404
  if (!prokerData) notFound();

  // 5. Render View
  return <ProkerDetailView data={prokerData} />;
}
