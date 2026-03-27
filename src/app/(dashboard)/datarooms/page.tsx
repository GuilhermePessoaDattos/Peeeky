"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DataRoomItem {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: { documents: number };
}

export default function DataRoomsPage() {
  const [rooms, setRooms] = useState<DataRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/datarooms");
      const data = await res.json();
      setRooms(data.dataRooms || []);
    } catch (error) {
      console.error("Failed to fetch data rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/datarooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create data room");
        return;
      }

      setName("");
      setDescription("");
      setShowCreate(false);
      await fetchRooms();
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to create data room");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Data Rooms</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90"
        >
          + New Data Room
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-[#1A1A2E]">Create Data Room</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Series A Due Diligence"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this data room"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setName(""); setDescription(""); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {rooms.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20">
          <div className="mb-4 text-4xl">&#128194;</div>
          <h2 className="mb-2 font-display text-lg font-semibold text-[#1A1A2E]">No data rooms yet</h2>
          <p className="mb-6 text-sm text-gray-500">Create a data room to share multiple documents via a single link.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[#6C5CE7] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6C5CE7]/90"
          >
            Create Data Room
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/datarooms/${room.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md hover:border-[#6C5CE7]/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">&#128194;</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  room.isActive ? "bg-[#00B894]/10 text-[#00B894]" : "bg-red-100 text-red-700"
                }`}>
                  {room.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="mb-1 font-display font-semibold text-[#1A1A2E] truncate group-hover:text-[#6C5CE7]">
                {room.name}
              </h3>
              {room.description && (
                <p className="mb-2 text-xs text-gray-500 truncate">{room.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{room._count.documents} docs</span>
                <span>{new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
