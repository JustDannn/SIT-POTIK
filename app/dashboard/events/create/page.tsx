import { getCurrentUser } from "@/utils/session";
import { redirect } from "next/navigation";
import CreateEventForm from "../_components/CreateEventForm";

export default async function CreateEventPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buat Event Baru</h1>
        <p className="text-gray-500 mt-1">
          Jadwalkan pelatihan, workshop, atau kegiatan divisi.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}
