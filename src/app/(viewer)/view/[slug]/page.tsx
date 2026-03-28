import { getLinkBySlug } from "@/modules/links";
import { getSignedViewUrl } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ViewerClient } from "./viewer-client";
import { AccessGate } from "./access-gate";
import { NdaGate } from "./nda-gate";

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

  // Check expiry
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A2E]">
        <div className="rounded-2xl bg-white p-8 text-center max-w-sm">
          <div className="mb-4 text-4xl">&#9200;</div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Link Expired</h1>
          <p className="mt-2 text-sm text-gray-500">This document link has expired. Contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  // Check max views
  if (link.maxViews) {
    const viewCount = await prisma.view.count({
      where: { linkId: link.id },
    });
    if (viewCount >= link.maxViews) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#1A1A2E]">
          <div className="rounded-2xl bg-white p-8 text-center max-w-sm">
            <div className="mb-4 text-4xl">&#128683;</div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">View Limit Reached</h1>
            <p className="mt-2 text-sm text-gray-500">This link has reached its maximum number of views.</p>
          </div>
        </div>
      );
    }
  }

  // If password or email required, show gate
  if (link.password || link.requireEmail) {
    return (
      <AccessGate
        linkId={link.id}
        slug={slug}
        requirePassword={!!link.password}
        requireEmail={link.requireEmail}
        documentName={link.document.name}
      />
    );
  }

  // If NDA required, show NDA gate
  if (link.requireNDA) {
    return (
      <NdaGate
        linkId={link.id}
        slug={slug}
        ndaText={link.ndaText || "By clicking 'I Agree', you acknowledge that the contents of this document are confidential and agree not to share, distribute, or disclose any information contained herein to any third party without prior written consent."}
        documentName={link.document.name}
      />
    );
  }

  const signedUrl = await getSignedViewUrl(link.document.fileUrl);

  return (
    <ViewerClient
      signedUrl={signedUrl}
      documentName={link.document.name}
      linkId={link.id}
      totalPages={link.document.pageCount}
      allowDownload={link.allowDownload}
      enableWatermark={link.enableWatermark}
      enableAIChat={link.enableAIChat}
      orgLogoUrl={link.document.org?.logoUrl || null}
      orgBrandColor={link.document.org?.brandColor || null}
      orgName={link.document.org?.name || null}
      orgPlan={link.document.org?.plan || "FREE"}
    />
  );
}
