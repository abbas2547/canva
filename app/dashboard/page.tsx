"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getUserDesigns,
  createDesign,
  deleteDesign,
  createOrUpdateUserProfile,
  duplicateDesign,
} from "@/lib/db-operations";
import {
  Loader2,
  Plus,
  LogOut,
  Trash2,
  Edit3,
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  MoreVertical,
  Copy,
  Heart,
  Share2,
  Download,
  X,
  Settings,
  Archive,
  Star,
  LayoutDashboard,
  Image as ImageIcon,
  PenTool,
  RotateCcw,
  FileText,
  LayoutTemplate,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type ViewMode = "grid" | "list";
type SortOption = "recent" | "oldest" | "name" | "popular";
type FilterOption = "all" | "designs" | "templates" | "shared" | "trashed";

interface Design {
  id: string;
  title: string;
  thumbnail: string | null;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isPublic: boolean;
  tags: string[];
  templateId: string | null;
  views: number;
  likes: number;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [showDesignMenu, setShowDesignMenu] = useState<string | null>(null);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?from=/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.uid) return;

    createOrUpdateUserProfile(user.uid, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    }).catch(console.error);
  }, [user?.uid]);

  const fetchDesigns = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userDesigns = await getUserDesigns(user.uid);
      setDesigns(userDesigns);
      setFilteredDesigns(userDesigns);
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to load designs");
    } finally {
      setFetching(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  useEffect(() => {
    let filtered = [...designs];

    if (filterOption === "trashed") {
      filtered = filtered.filter((d) => d.deletedAt);
    } else if (filterOption === "designs") {
      filtered = filtered.filter((d) => !d.deletedAt && !d.templateId);
    } else if (filterOption === "templates") {
      filtered = filtered.filter((d) => d.templateId);
    } else if (filterOption === "shared") {
      filtered = filtered.filter((d) => d.isPublic && !d.deletedAt);
    } else {
      filtered = filtered.filter((d) => !d.deletedAt);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "popular":
          return b.views - a.views;
        default:
          return 0;
      }
    });

    setFilteredDesigns(filtered);
  }, [designs, searchQuery, sortOption, filterOption]);

  const handleCreateDesign = async (width = 1080, height = 1080, templateId?: string) => {
    if (!user?.uid) return;
    setCreating(true);
    try {
      const newDesign = await createDesign(user.uid, "Untitled Design", width, height);
      if (templateId) {
        // Apply template if provided
      }
      router.push(`/editor/${newDesign.id}`);
      toast.success("Design created!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create design");
    } finally {
      setCreating(false);
      setShowCreateMenu(false);
    }
  };

  const handleDuplicateDesign = async (designId: string) => {
    if (!user?.uid) return;
    try {
      const newDesign = await duplicateDesign(designId, user.uid);
      router.push(`/editor/${newDesign.id}`);
      toast.success("Design duplicated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to duplicate design");
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    setDesignToDelete(designId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!designToDelete) return;
    try {
      await deleteDesign(designToDelete);
      setDesigns((prev) => prev.filter((d) => d.id !== designToDelete));
      toast.success("Design moved to trash");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete design");
    } finally {
      setShowDeleteConfirm(false);
      setDesignToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 7) return formatDate(dateString);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="text-slate-600">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="text-slate-600">Redirecting to login...</span>
        </div>
      </div>
    );
  }

  const createOptions = [
    { label: "Custom dimensions", icon: Settings, action: () => handleCreateDesign(1080, 1080) },
    { label: "Instagram Post (1080x1080)", icon: ImageIcon, action: () => handleCreateDesign(1080, 1080) },
    { label: "Instagram Story (1080x1920)", icon: ImageIcon, action: () => handleCreateDesign(1080, 1920) },
    { label: "Facebook Post (1200x630)", icon: ImageIcon, action: () => handleCreateDesign(1200, 630) },
    { label: "YouTube Thumbnail (1280x720)", icon: ImageIcon, action: () => handleCreateDesign(1280, 720) },
    { label: "Presentation (1920x1080)", icon: LayoutDashboard, action: () => handleCreateDesign(1920, 1080) },
    { label: "A4 Document (210mm x 297mm)", icon: FileText, action: () => handleCreateDesign(794, 1123) },
    { label: "Poster (24x36 in)", icon: ImageIcon, action: () => handleCreateDesign(2400, 3600) },
  ];

  return (
    <div className="page-transition min-h-screen bg-transparent">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="font-semibold text-slate-900 text-xl hidden sm:block">MiniCanva</span>
              </button>
              
              {/* Navigation tabs */}
              <div className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-1" /> Designs
                </button>
                <button
                  onClick={() => router.push("/templates")}
                  className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <ImageIcon className="w-4 h-4 inline mr-1" /> Templates
                </button>
                <button
                  onClick={() => router.push("/brand")}
                  className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <Star className="w-4 h-4 inline mr-1" /> Brand Kit
                </button>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 sm:w-80 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Create Button */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition disabled:opacity-60"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Create a design</span>
                </button>
                
                {/* Create Menu Dropdown */}
                <AnimatePresence>
                  {showCreateMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50"
                      role="menu"
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start from scratch</p>
                      </div>
                      {createOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={option.action}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          role="menuitem"
                        >
                          <option.icon className="w-5 h-5 text-slate-400" />
                          {option.label}
                        </button>
                      ))}
                      <div className="my-1 border-t border-slate-100" />
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Browse templates</p>
                      </div>
                      <button
                        onClick={() => router.push("/templates")}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition"
                        role="menuitem"
                      >
                        <LayoutTemplate className="w-5 h-5" />
                        View all templates
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
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
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50"
                      role="menu"
                    >
                      <div className="px-3 py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-900">{user.displayName || "User"}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push("/profile"); setShowProfileMenu(false); }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Settings className="w-5 h-5" />
                        Account settings
                      </button>
                      <button
                        onClick={() => { router.push("/pricing"); setShowProfileMenu(false); }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Star className="w-5 h-5" />
                        Upgrade to Pro
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        role="menuitem"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        {!fetching && filterOption !== "trashed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="text-white/80 mb-5 max-w-lg">
                What would you like to create today? Start from a template or pick up where you left off.
              </p>
              <button
                onClick={() => setShowCreateMenu(true)}
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-white/90 transition shadow-lg active:scale-[0.98]"
              >
                <Plus size={18} />
                Create a design
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your designs</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {filterOption === "trashed" 
                ? "Deleted designs - restore or permanently delete"
                : `${filteredDesigns.length} design${filteredDesigns.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOption(filterOption === "all" ? "designs" : "all")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 pr-8 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">Recent</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name (A-Z)</option>
                <option value="popular">Most viewed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Start Templates */}
        {!fetching && filterOption !== "trashed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">You might want to try</h2>
              <button
                onClick={() => setShowCreateMenu(true)}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition"
              >
                See all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Instagram Post", w: 1080, h: 1080, color: "from-pink-500 to-purple-500", icon: "📱" },
                { name: "YouTube Thumbnail", w: 1280, h: 720, color: "from-red-500 to-orange-500", icon: "🎬" },
                { name: "Presentation", w: 1920, h: 1080, color: "from-blue-500 to-cyan-500", icon: "📊" },
                { name: "Poster", w: 800, h: 1200, color: "from-emerald-500 to-teal-500", icon: "🖼️" },
                { name: "Story", w: 1080, h: 1920, color: "from-violet-500 to-indigo-500", icon: "📖" },
                { name: "Business Card", w: 1050, h: 600, color: "from-amber-500 to-yellow-500", icon: "💼" },
                { name: "Logo", w: 500, h: 500, color: "from-rose-500 to-pink-500", icon: "✨" },
                { name: "Resume", w: 800, h: 1100, color: "from-teal-500 to-green-500", icon: "📄" },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleCreateDesign(preset.w, preset.h)}
                  disabled={creating}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.97]"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center text-white text-xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                    {preset.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{preset.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{preset.w}×{preset.h}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Designs Grid/List */}
        <AnimatePresence mode="wait">
          {fetching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredDesigns.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-5">
                {filterOption === "trashed" ? (
                  <Archive className="text-indigo-500" size={32} />
                ) : (
                  <PenTool className="text-indigo-500" size={32} />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {filterOption === "trashed" ? "Trash is empty" : "No designs here yet"}
              </h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {filterOption === "trashed"
                  ? "Deleted designs will appear here. You can restore them within 30 days."
                  : "Create your first design to get started. It only takes a minute!"}
              </p>
              {filterOption !== "trashed" && (
                <button
                  onClick={() => setShowCreateMenu(true)}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  <Plus size={18} />
                  Create your first design
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="designs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-3"
              }
            >
              {filteredDesigns.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  viewMode={viewMode}
                  onEdit={() => router.push(`/editor/${design.id}`)}
                  onDuplicate={() => handleDuplicateDesign(design.id)}
                  onDelete={() => handleDeleteDesign(design.id)}
                  onMenuClick={(id) => setShowDesignMenu(id === showDesignMenu ? null : id)}
                  showMenu={showDesignMenu === design.id}
                  isTrashed={!!design.deletedAt}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination placeholder */}
        {filteredDesigns.length > 20 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">1</button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">2</button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">3</button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => { setShowDeleteConfirm(false); setDesignToDelete(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete design?</h3>
                  <p className="text-sm text-slate-500">This will move it to trash. You can restore it within 30 days.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDesignToDelete(null); }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .design-card:hover .design-actions {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// Design Card Component
function DesignCard({ 
  design, 
  viewMode, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onMenuClick,
  showMenu,
  isTrashed
}: { 
  design: Design; 
  viewMode: ViewMode;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMenuClick: (id: string) => void;
  showMenu: boolean;
  isTrashed: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onMenuClick("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onMenuClick]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all p-4 flex items-center gap-4">
        <div className="relative w-20 h-15 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
          {design.thumbnail ? (
            <img src={design.thumbnail} alt={design.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <PenTool size={20} />
            </div>
          )}
          {isTrashed && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Archive className="text-white" size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{design.title}</h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span>{design.width} × {design.height}</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(design.updatedAt)}
            </span>
            {design.isPublic && (
              <span className="flex items-center gap-1 text-indigo-600">
                <Share2 size={12} />
                Public
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTrashed ? (
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
              title="Restore"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                title="Edit"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={onDuplicate}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                title="Duplicate"
              >
                <Copy size={18} />
              </button>
            </>
          )}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); onMenuClick(design.id); }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-20"
              >
                {!isTrashed && (
                  <>
                    <button onClick={() => { onEdit(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Edit3 size={16} /> Edit
                    </button>
                    <button onClick={() => { onDuplicate(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Copy size={16} /> Duplicate
                    </button>
                    <button onClick={() => { /* share */ onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Share2 size={16} /> Share
                    </button>
                    <button onClick={() => { /* download */ onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Download size={16} /> Download
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button onClick={() => { onDelete(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 size={16} /> Move to trash
                    </button>
                  </>
                )}
                {isTrashed && (
                  <>
                    <button onClick={() => { /* restore */ onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                      <RotateCcw size={16} /> Restore
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button onClick={() => { /* delete forever */ onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 size={16} /> Delete forever
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 border border-slate-200 hover:border-indigo-200 cursor-pointer"
      onClick={onEdit}
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
          <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool size={28} className="text-indigo-400" />
            </div>
            <span className="text-xs text-center px-2 font-medium">Blank design</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {design.templateId && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Template</span>
          )}
          {design.isPublic && !isTrashed && (
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Public</span>
          )}
          {isTrashed && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">Trashed</span>
          )}
        </div>

        {/* Favorite/Star */}
        <button
          onClick={(e) => { e.stopPropagation(); /* toggle favorite */ }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-500 hover:text-yellow-500 hover:bg-white transition"
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Overlay actions (visible on hover) */}
        {!isTrashed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center gap-3 pb-4">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2.5 bg-white rounded-full text-slate-800 hover:bg-indigo-600 hover:text-white transition shadow-lg active:scale-95"
              title="Edit design"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-2.5 bg-white rounded-full text-slate-800 hover:bg-slate-100 transition shadow-lg active:scale-95"
              title="Duplicate"
            >
              <Copy size={18} />
            </button>
          </div>
        )}

        {isTrashed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 text-center max-w-xs mx-4">
              <Archive className="text-red-500 mx-auto mb-2" size={32} />
              <p className="text-sm font-medium text-slate-700">In trash</p>
              <p className="text-xs text-slate-500 mt-1">Click to restore or delete permanently</p>
            </div>
          </div>
        )}

        {/* Design Menu */}
        <div ref={menuRef} className="absolute bottom-2 right-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onMenuClick(design.id); }}
            className="p-1.5 bg-white/90 rounded-full text-slate-500 hover:text-slate-700 hover:bg-white transition shadow-md opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg py-1"
            >
              {!isTrashed && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Edit3 size={16} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDuplicate(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Copy size={16} /> Duplicate
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Share2 size={16} /> Share
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Download size={16} /> Download
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={16} /> Move to trash
                  </button>
                </>
              )}
              {isTrashed && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                    <RotateCcw size={16} /> Restore
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={(e) => { e.stopPropagation(); onMenuClick(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={16} /> Delete forever
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{design.title}</h3>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span className="font-mono">{design.width} × {design.height}</span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(design.updatedAt)}
          </span>
        </div>
        {design.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {design.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {design.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full">
                +{design.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
