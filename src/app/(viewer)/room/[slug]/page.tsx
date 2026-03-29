import { getDataRoomBySlug, getVisibleDocuments } from "@/modules/datarooms";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function DataRoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getDataRoomBySlug(slug);
  if (!room || !room.isActive) notFound();

  // Get viewer email from cookie (set during email verification gate)
  const viewerEmail = (await cookies()).get("viewer_email")?.value || null;
  const visibleDocs = await getVisibleDocuments(room.id, viewerEmail);

  // If access rules exist but viewer has no access, show empty state
  const documents: any[] = visibleDocs ?? room.documents;

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">{room.name}</h1>
          {room.description && <p className="mt-1 text-sm text-gray-500">{room.description}</p>}
          <p className="mt-2 text-xs text-gray-400">
            {room.org.name} &middot; {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {documents.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No documents available for your access level.</p>
          </div>
        )}

        {/* Group documents by folder */}
        {(() => {
          const folderMap = new Map<string, { name: string; docs: typeof documents }>();
          const rootDocs: typeof documents = [];

          for (const d of documents) {
            const folder = (d as any).folder;
            if (folder?.id) {
              if (!folderMap.has(folder.id)) folderMap.set(folder.id, { name: folder.name, docs: [] });
              folderMap.get(folder.id)!.docs.push(d);
            } else {
              rootDocs.push(d);
            }
          }

          return (
            <div className="space-y-4">
              {/* Folders */}
              {Array.from(folderMap.entries()).map(([fId, folder]) => (
                <div key={fId} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm">&#128193;</span>
                    <span className="text-sm font-semibold text-[#1A1A2E]">{folder.name}</span>
                    <span className="text-xs text-gray-400">{folder.docs.length} doc{folder.docs.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {folder.docs.map((d, i) => (
                      <div key={d.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                            {d.document.fileType === "PDF" ? "\u{1F4C4}" : "\u{1F4CA}"}
                          </span>
                          <div>
                            <h3 className="font-medium text-[#1A1A2E]">{d.document.name}</h3>
                            <p className="text-xs text-gray-400">{d.document.pageCount} page{d.document.pageCount !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Root documents (no folder) */}
              {rootDocs.length > 0 && (
                <div className="space-y-3">
                  {rootDocs.map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-lg">
                          {d.document.fileType === "PDF" ? "\u{1F4C4}" : "\u{1F4CA}"}
                        </span>
                        <div>
                          <h3 className="font-medium text-[#1A1A2E]">{d.document.name}</h3>
                          <p className="text-xs text-gray-400">{d.document.pageCount} page{d.document.pageCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        <div className="mt-8 text-center">
          <a
            href="https://peeeky.com?utm_source=viewer&utm_medium=badge&utm_campaign=viral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-300 hover:text-gray-400"
          >
            Secured by Peeeky — Track your documents free &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
