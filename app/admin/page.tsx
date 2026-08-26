"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin";
import Link from "next/link";
import {
  RefreshCw,
  Activity,
  LogIn,
  Menu,
  X,
  Clock,
  Wifi,
  WifiOff,
  Trash2,
  Users,
  Palette,
  Download,
  Search,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

interface LogType {
  id: string;
  email: string;
  action: string;
  timestamp: string;
}

interface StatsType {
  users: number;
  designs: number;
  logins: number;
}

interface ActiveUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastSeen: string;
}

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastSignInTime: string;
  creationTime: string;
  disabled: boolean;
}

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {icon && <div className={color}>{icon}</div>}
      </div>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function AdminPanel() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "logs">("overview");
  const [logs, setLogs] = useState<LogType[]>([]);
  const [stats, setStats] = useState<StatsType>({
    users: 0,
    designs: 0,
    logins: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const isAdmin = checkAdminAccess(user?.email);

  const loadAdminData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Admin API returned ${response.status} instead of JSON`);
      }
      const result = (await response.json()) as {
        activeUsers?: ActiveUser[];
        logs?: LogType[];
        authUsers?: AuthUser[];
        stats?: StatsType;
        error?: string;
        details?: string;
      };
      console.log("Admin API response:", {
        status: response.status,
        data: result,
      });
      if (!response.ok) {
        throw new Error(result.details || result.error || `Request failed with status ${response.status}`);
      }
      setActiveUsers(result.activeUsers || []);
      setLogs(result.logs || []);
      setAuthUsers(result.authUsers || []);
      setStats(result.stats || { users: 0, designs: 0, logins: 0 });
      setLastUpdated(new Date());
      setDataError(null);
    } catch (error) {
      console.error("REAL ADMIN ERROR:", error);
      setDataError(error instanceof Error ? error.message : "Unable to load Firebase admin data.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !checkAdminAccess(user.email)) {
      router.replace("/dashboard");
      return;
    }
    if (!isLive) {
      return;
    }
    const initialRequest = window.setTimeout(() => {
      void loadAdminData();
    }, 0);
    const refreshTimer = window.setInterval(() => {
      void loadAdminData();
    }, 5000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(refreshTimer);
    };
  }, [user, authLoading, router, isLive, refreshNonce, loadAdminData]);

  const fetchAdminData = useCallback(() => {
    setDataLoading(true);
    setDataError(null);
    setRefreshNonce((value) => value + 1);
  }, []);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.email.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const filteredAuthUsers = useMemo(() => {
    const query = userSearchQuery.trim().toLowerCase();
    if (!query) return authUsers;
    return authUsers.filter((authUser) => {
      const nickname = authUser.displayName || authUser.email.split("@")[0];
      return (
        nickname.toLowerCase().includes(query) ||
        authUser.email.toLowerCase().includes(query)
      );
    });
  }, [authUsers, userSearchQuery]);

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Authentication required");
      const response = await fetch(`/api/admin/overview?deleteLog=${encodeURIComponent(logId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to delete log");
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (error) {
      console.error("Failed to delete log:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportLogs = () => {
    const rows = filteredLogs.map((log) =>
      [log.email, log.action, log.timestamp].map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
    );
    const csv = ["Email,Action,Timestamp", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mini-canva-auth-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleLive = () => setIsLive((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-[#020617]/90 px-4 py-3 backdrop-blur-md">
        <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent">
          Admin Panel
        </h1>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <nav className="flex flex-col p-4">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("logs");
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Auth Logs
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                setMobileMenuOpen(false);
              }}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Firebase Users
            </button>
            <div className="my-2 border-t border-slate-800" />
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-800 lg:bg-[#020617]">
        <div className="flex flex-1 flex-col p-6">
          <h1 className="mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
            Admin Panel
          </h1>
          <nav className="flex flex-1 flex-col gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Activity size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "logs"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LogIn size={18} />
              Auth Logs
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users size={18} />
              Firebase Users
            </button>
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    Admin
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md lg:block">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white">
                {activeTab === "overview"
                  ? "Overview"
                  : activeTab === "users"
                    ? "Firebase Users"
                    : "Activity Logs"}
              </h2>
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5">
                {isLive ? (
                  <Wifi size={14} className="text-emerald-400" />
                ) : (
                  <WifiOff size={14} className="text-slate-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isLive ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {isLive ? "Live" : "Paused"}
                </span>
                <button
                  onClick={toggleLive}
                  className="rounded-full p-0.5 transition-colors hover:bg-slate-800"
                  title={isLive ? "Pause auto-refresh" : "Resume auto-refresh"}
                >
                  {isLive ? (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={fetchAdminData}
                disabled={dataLoading}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
              >
                <RefreshCw size={14} className={dataLoading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleExportLogs}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={14} />
                Export CSV
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Header Info Bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2">
            {isLive ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-slate-500" />
            )}
            <span
              className={`text-xs font-medium ${
                isLive ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {isLive ? "Live" : "Paused"}
            </span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={toggleLive}
            className="ml-auto rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  <ShieldCheck size={15} />
                  Secure control center
                </div>
                <h2 className="text-2xl font-black text-white sm:text-3xl">Welcome back, Abbas.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Monitor your creative platform, review authentication activity, and keep the workspace healthy.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                <span className="block text-xs text-slate-500">Current status</span>
                <span className="mt-1 flex items-center gap-2 font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />All systems operational</span>
              </div>
            </div>
          </div>
          {dataError && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              <span>{dataError}</span>
              <button onClick={fetchAdminData} className="font-semibold underline hover:text-white">Retry</button>
            </div>
          )}
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-400">
                  Platform Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Users"
                  value={stats.users}
                  color="text-emerald-400"
                  icon={<Users size={20} />}
                />
                <StatCard
                  title="Total Designs"
                  value={stats.designs}
                  color="text-cyan-400"
                  icon={<Palette size={20} />}
                />
                <StatCard
                  title="Login Events"
                  value={stats.logins}
                  color="text-violet-400"
                  icon={<LogIn size={20} />}
                />
                <StatCard
                  title="System Status"
                  value="Healthy"
                  color="text-emerald-400"
                  icon={<Activity size={20} />}
                />
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Recent activity</h3>
                      <p className="mt-1 text-xs text-slate-500">Latest authentication events</p>
                    </div>
                    <button onClick={() => setActiveTab("logs")} className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-white">View all <ArrowUpRight size={13} /></button>
                  </div>
                  <div className="space-y-3">
                    {logs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">{log.email || "Unknown user"}</p>
                          <p className="text-xs text-slate-500">{log.action}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-500">{formatTimestamp(log.timestamp)}</span>
                      </div>
                    ))}
                    {logs.length === 0 && <p className="py-4 text-sm text-slate-500">No recent activity.</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-violet-500/10 to-transparent p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Quick insight</p>
                  <p className="mt-4 text-3xl font-black text-white">{stats.logins}</p>
                  <p className="mt-1 text-sm text-slate-400">events in the latest activity window</p>
                  <button onClick={handleExportLogs} className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-white"><Download size={15} /> Download report</button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Currently online</h3>
                    <p className="mt-1 text-xs text-slate-500">Live users with an active session</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{activeUsers.length} online</span>
                </div>
                {activeUsers.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">No other users are currently online.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {activeUsers.map((activeUser) => {
                      const nickname = activeUser.displayName.trim() || activeUser.email.split("@")[0] || "User";
                      return (
                        <div key={activeUser.uid} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
                          {activeUser.photoURL ? (
                            <img src={activeUser.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-slate-950">{nickname.charAt(0).toUpperCase()}</div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{nickname}</p>
                            <p className="truncate text-xs text-slate-500">{activeUser.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Firebase Authentication users</h3>
                    <p className="mt-1 text-xs text-slate-500">Accounts and their latest Firebase sign-in</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{authUsers.length} accounts</span>
                </div>
                {authUsers.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">No Firebase Authentication users found.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {authUsers.map((authUser) => {
                      const nickname = authUser.displayName.trim() || authUser.email.split("@")[0] || "User";
                      const online = activeUsers.some((activeUser) => activeUser.uid === authUser.uid);
                      return (
                        <div key={authUser.uid} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
                          {authUser.photoURL ? (
                            <img src={authUser.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-pink-500 text-sm font-bold text-slate-950">{nickname.charAt(0).toUpperCase()}</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-white">{nickname}</p>
                              <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-slate-600"}`} title={online ? "Online" : "Offline"} />
                            </div>
                            <p className="truncate text-xs text-slate-500">{authUser.email}</p>
                          </div>
                          <span className="shrink-0 text-right text-[11px] text-slate-500">
                            Last login<br />{formatTimestamp(authUser.lastSignInTime)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-sm font-medium text-slate-400">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => setActiveTab("logs")}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                      <LogIn size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        View Auth Logs
                      </p>
                      <p className="text-xs text-slate-500">
                        Recent authentication events
                      </p>
                    </div>
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Palette size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Manage Designs
                      </p>
                      <p className="text-xs text-slate-500">
                        View and manage user designs
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={fetchAdminData}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Refresh Data
                      </p>
                      <p className="text-xs text-slate-500">
                        Fetch latest platform data
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Firebase Users Tab */}
          {activeTab === "users" && (
            <div className="animate-fade-in">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Firebase Authentication</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Users & sign-in history</h3>
                  <p className="mt-2 text-sm text-slate-400">Every account registered in Firebase Authentication.</p>
                </div>
                <div className="relative w-full lg:w-80">
                  <input
                    type="search"
                    placeholder="Search name or email..."
                    value={userSearchQuery}
                    onChange={(event) => setUserSearchQuery(event.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {filteredAuthUsers.length} of {authUsers.length} accounts</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Online now</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-white/[0.03]">
                      <tr className="border-b border-slate-800">
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">User</th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Last login</th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Created</th>
                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredAuthUsers.map((authUser) => {
                        const nickname = authUser.displayName.trim() || authUser.email.split("@")[0] || "User";
                        const online = activeUsers.some((activeUser) => activeUser.uid === authUser.uid);
                        return (
                          <tr key={authUser.uid} className="transition hover:bg-white/[0.03]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {authUser.photoURL ? (
                                  <img src={authUser.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 font-bold text-slate-950">{nickname.charAt(0).toUpperCase()}</div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">{nickname}</p>
                                  <p className="truncate text-[11px] text-slate-500">{authUser.uid}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-300">{authUser.email || "No email"}</td>
                            <td className="px-5 py-4 text-sm text-slate-400">{formatTimestamp(authUser.lastSignInTime)}</td>
                            <td className="px-5 py-4 text-sm text-slate-400">{formatTimestamp(authUser.creationTime)}</td>
                            <td className="px-5 py-4 text-right">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${online ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-slate-500"}`} />
                                {authUser.disabled ? "Disabled" : online ? "Online" : "Offline"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredAuthUsers.length === 0 && <p className="px-6 py-14 text-center text-sm text-slate-500">No Firebase users match your search.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-medium text-slate-400">
                  Authentication Logs ({filteredLogs.length})
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-slate-700 focus:ring-1 focus:ring-slate-700 sm:w-72"
                  />
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                          User Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-sm text-slate-500"
                          >
                            No logs found.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="transition-colors hover:bg-slate-800/30"
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                              {log.email}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                              {log.action}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                {log.action.toLowerCase().includes("login")
                                  ? "Login"
                                  : "Activity"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                disabled={deletingId === log.id}
                                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete log"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
