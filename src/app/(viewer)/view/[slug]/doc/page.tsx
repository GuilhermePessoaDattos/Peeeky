import { getLinkBySlug } from "@/modules/links";
import { getSignedViewUrl } from "@/lib/r2";
import { notFound } from "next/navigation";
import { ViewerClient } from "../viewer-client";

export default async function VerifiedViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const { email } = await searchParams;
  const link = await getLinkBySlug(slug);

  if (!link || !link.isActive) {
    notFound();
  }

  const signedUrl = await getSignedViewUrl(link.document.fileUrl);

  return (
    <ViewerClient
      signedUrl={signedUrl}
      documentName={link.document.name}
      linkId={link.id}
      totalPages={link.document.pageCount}
      allowDownload={link.allowDownload}
      viewerEmail={email}
    />
  );
}
