import React from "react";
import MinuteForm from "../../_components/MinuteForm";
import { getMinuteById, getProkerOptions } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditMinutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, prokerOptions] = await Promise.all([
    getMinuteById(Number(id)),
    getProkerOptions(),
  ]);

  if (!data) return notFound();

  return <MinuteForm initialData={data} prokerOptions={prokerOptions} />;
}
