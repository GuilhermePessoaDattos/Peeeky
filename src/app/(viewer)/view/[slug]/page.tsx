import { getLinkBySlug } from "@/modules/links";
import { getSignedViewUrl } from "@/lib/r2";
import { notFound } from "next/navigation";
import { ViewerClient } from "./viewer-client";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link || !link.isActive) {
    notFound();
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Link Expired</h1>
          <p className="mt-2 text-gray-500">This document link has expired.</p>
        </div>
      </div>
    );
  }

  const signedUrl = await getSignedViewUrl(link.document.fileUrl);

  return (
    <ViewerClient
      signedUrl={signedUrl}
      documentName={link.document.name}
      linkId={link.id}
      totalPages={link.document.pageCount}
    />
  );
}
