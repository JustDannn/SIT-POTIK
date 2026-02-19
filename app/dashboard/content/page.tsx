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

  const result = await getContentList();
  const { role, data } = result;

  // View KETUA (Social Media Plan + cross-division publications)
  if (role === "Ketua") {
    return (
      <KetuaContentView
        data={data}
        publications={(result as any).publications ?? []}
      />
    );
  }

  // View KOORDINATOR (Artikel & Publikasi Web)
  if (role === "Koordinator") {
    return <KoordinatorContentView data={data} />;
  }

  // ALL OTHER ROLES — Can request content from Media & Branding
  return <KoordinatorContentView data={data} />;
}
