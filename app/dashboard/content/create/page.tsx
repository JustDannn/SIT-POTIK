import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PublicationForm from "../_components/PublicationForm"; // Import komponen baru

export default async function CreateContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Kirim data user ke form (jika butuh ID/Nama di client side logic)
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 pt-6">
        <PublicationForm user={user} />
      </div>
    </div>
  );
}
