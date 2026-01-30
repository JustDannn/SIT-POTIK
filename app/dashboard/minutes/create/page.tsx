import React from "react";
import MinuteForm from "../_components/MinuteForm";
import { getProkerOptions } from "../actions";

export default async function CreateMinutePage() {
  const prokerOptions = await getProkerOptions();
  return <MinuteForm prokerOptions={prokerOptions} />;
}
