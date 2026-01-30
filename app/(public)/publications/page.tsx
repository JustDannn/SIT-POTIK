import React from "react";
import { getPublishedContent } from "./actions";
import PublicationFeed from "./PublicationFeed";

export const revalidate = 60;

export default async function PublicPublicationsPage() {
  const data = await getPublishedContent();

  return (
    <div className="min-h-screen">
      {/* Spacer karena Navbar lu fixed */}
      <div className="h-20" />

      {/* 2. Main Content */}
      <main>
        <PublicationFeed initialData={data} />
      </main>
    </div>
  );
}
