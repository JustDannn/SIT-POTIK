import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getContentList } from "./actions";

import KetuaContentView from "./_views/KetuaContentView";
import KoordinatorContentView from "./_views/KoordinatorContentView";

export default async function ContentPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { role, data } = await getContentList();

  // View KETUA (Social Media Plan)
  if (role === "Ketua") {
    return <KetuaContentView data={data} />;
  }

  // View KOORDINATOR (Artikel & Publikasi Web)
  if (role === "Koordinator") {
    return <KoordinatorContentView data={data} />;
  }

  return (
    <div className="p-10 text-center text-gray-400">
      Anda tidak memiliki akses ke fitur konten.
    </div>
  );
}
