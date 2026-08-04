"use client";

import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUserDesigns,
  createDesign,
  deleteDesign,
  createOrUpdateUserProfile,
} from "@/lib/db-operations";
import { Loader2, Plus, LogOut, Trash2, Edit3, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [designs, setDesigns] = useState<
    Awaited<ReturnType<typeof getUserDesigns>>
  >([]);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?from=/dashboard");
    }
  }, [user, loading, router]);

  const fetchDesigns = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setFetching(true);
      const userDesigns = await getUserDesigns(user.uid);
      setDesigns(userDesigns);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    createOrUpdateUserProfile(user.uid, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    }).catch(console.error);

    fetchDesigns();
  }, [user, fetchDesigns]);

  const handleCreateDesign = async () => {
    if (!user?.uid) return;
    setCreating(true);
    try {
      const newDesign = await createDesign(user.uid, "Untitled Design", 1080, 1080);
      // Use static route with query parameter
      router.push(`/editor/design-1?id=${newDesign.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm("Delete this design? It will be moved to trash.")) return;
    await deleteDesign(designId);
    setDesigns((prev) => prev.filter((d) => d.id !== designId));
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin mr-2 text-indigo-600" size={28} />
        <span className="text-slate-600">Loading your workspace...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin mr-2 text-indigo-600" size={28} />
        <span className="text-slate-600">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar (Canva style) */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-semibold text-slate-800 text-xl">MiniCanva</span>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-slate-700 hidden sm:block">
                  {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-500 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Create button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your designs</h1>
            <p className="text-slate-500 mt-1">Create, edit, and manage your creative projects</p>
          </div>
          <button
            onClick={handleCreateDesign}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow transition disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {creating ? "Creating..." : "Create a design"}
          </button>
        </div>

        {/* Designs grid */}
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-indigo-600 mr-2" size={24} />
            <span className="text-slate-500">Loading your designs...</span>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Plus className="text-indigo-600" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No designs yet</h2>
            <p className="text-slate-500 mb-6">Click "Create a design" to start your first project.</p>
            <button
              onClick={handleCreateDesign}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              <Plus size={18} />
              Create a design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-indigo-200"
              >
                {/* Thumbnail area */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {design.thumbnail ? (
                    <img
                      src={design.thumbnail}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-1">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <span className="text-xs">Preview not available</span>
                    </div>
                  )}
                  {/* Overlay actions (visible on hover) */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      // Static route with query parameter
                      onClick={() => router.push(`/editor/design-1?id=${design.id}`)}
                      className="p-2 bg-white rounded-full text-slate-800 hover:bg-indigo-600 hover:text-white transition"
                      title="Edit design"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(design.id)}
                      className="p-2 bg-white rounded-full text-slate-800 hover:bg-red-600 hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate">{design.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{design.width} × {design.height}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(design.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}