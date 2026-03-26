export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">
          Documents
        </h1>
        <button className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90">
          + Upload Document
        </button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20">
        <div className="mb-4 text-4xl">&#128196;</div>
        <h2 className="mb-2 font-display text-lg font-semibold text-[#1A1A2E]">
          No documents yet
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Upload your first document and start tracking who reads it.
        </p>
        <button className="rounded-lg bg-[#6C5CE7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90">
          Upload Document
        </button>
      </div>
    </div>
  );
}
