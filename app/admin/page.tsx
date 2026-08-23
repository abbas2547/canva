"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseData";
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
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");
  const [logs, setLogs] = useState<LogType[]>([]);
  const [stats, setStats] = useState<StatsType>({
    users: 0,
    designs: 0,
    logins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from("auth_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      const { count: designsCount } = await supabase
        .from("designs")
        .select("*", { count: "exact", head: true });

      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      setLogs(
        (logsData || []).map((log: Record<string, unknown>) => ({
          id: String(log.id || ""),
          email: String(log.email || ""),
          action: String(log.action || ""),
          timestamp: String(log.timestamp || ""),
        }))
      );

      setStats({
        users: usersCount || 0,
        designs: designsCount || 0,
        logins: logsData?.length || 0,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || !checkAdminAccess(user.email)) {
      router.push("/dashboard");
      return;
    }
    setIsAdmin(true);
    fetchAdminData();
  }, [user, loading, router, fetchAdminData]);

  useEffect(() => {
    if (isLive && isAdmin) {
      intervalRef.current = setInterval(() => {
        fetchAdminData();
      }, 30000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, isAdmin, fetchAdminData]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.email.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    try {
      const { error } = await supabase
        .from("auth_logs")
        .delete()
        .eq("id", logId);
      if (error) throw error;
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (error) {
      console.error("Failed to delete log:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleLive = () => setIsLive((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return ts;
    }
  };

  if (loading) {
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
                {activeTab === "overview" ? "Overview" : "Auth Logs"}
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
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
              >
                <RefreshCw size={14} />
                Refresh
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
                  <Activity
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
