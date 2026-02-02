import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import PublicationForm from "../../_components/PublicationForm"; // Import form yang sama
import { getPublicationById } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: PageProps) {
  const { id } = await params;
  const contentId = parseInt(id, 10);

  if (isNaN(contentId)) notFound();

  // Cek Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ambil Data Konten Existing
  const contentData = await getPublicationById(contentId);
  if (!contentData) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Konten tidak ditemukan</h1>
        <a href="/dashboard/content" className="text-blue-500 hover:underline">
          Kembali
        </a>
      </div>
    );
  }

  // Render Form dengan Data Awal (initialData)
  // Form akan otomatis masuk mode "Edit" karena ada initialData
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 pb-20">
        <PublicationForm user={user} initialData={contentData} />
      </div>
    </div>
  );
}
