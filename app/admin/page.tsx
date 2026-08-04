"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabaseData";

import {
  checkAdminAccess,
} from "@/lib/admin";

import Link from "next/link";

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

export default function AdminPanel() {

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const router =
    useRouter();

  const [logs, setLogs] =
    useState<LogType[]>([]);

  const [stats, setStats] =
    useState<StatsType>({
      users: 0,
      designs: 0,
      logins: 0,
    });

  const [fetching, setFetching] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("overview");

  // =====================================================
  // SECURITY CHECK
  // =====================================================

  useEffect(() => {

    if (loading) return;

    if (
      !user ||
      !checkAdminAccess(
        user.email
      )
    ) {

      router.push(
        "/dashboard"
      );

      return;
    }

    fetchAdminData();

  }, [user, loading, router]);

  // =====================================================
  // FETCH ADMIN DATA
  // =====================================================

  const fetchAdminData =
    async () => {

      try {

        setFetching(true);

        // FETCH AUTH LOGS
        const {
          data: logData,
          error: logError,
        } = await supabase
          .from("auth_logs")
          .select("*")
          .order(
            "timestamp",
            {
              ascending: false,
            }
          )
          .limit(50);

        if (logError) {

          console.error(
            "Log Fetch Error:",
            logError.message
          );

        }

        // FETCH DESIGN COUNT
        const {
          count: designCount,
          error: designError,
        } = await supabase
          .from("designs")
          .select("*", {
            count: "exact",
            head: true,
          });

        if (designError) {

          console.error(
            "Design Count Error:",
            designError.message
          );

        }

        // FETCH USER COUNT
        const {
          count: userCount,
          error: userError,
        } = await supabase
          .from("users")
          .select("*", {
            count: "exact",
            head: true,
          });

        if (userError) {

          console.error(
            "User Count Error:",
            userError.message
          );

        }

        // LOGIN STATS
        const totalLogins =
          logData?.filter(
            (log) =>
              log.action ===
              "LOGIN"
          ).length || 0;

        setLogs(
          logData || []
        );

        setStats({
          users:
            userCount || 0,
          designs:
            designCount || 0,
          logins:
            totalLogins,
        });

      } catch (error) {

        console.error(
          "Admin Fetch Error:",
          error
        );

      } finally {

        setFetching(false);

      }
    };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout =
    async () => {

      try {

        await logout();

        router.push("/");

      } catch (error) {

        console.error(
          "Logout Error:",
          error
        );

      }
    };

  // =====================================================
  // FILTER LOGS
  // =====================================================

  const filteredLogs =
    useMemo(() => {

      return logs.filter(
        (log) =>
          log.email
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          log.action
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      );

    }, [logs, searchQuery]);

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading || fetching) {

    return (

      <div className="h-screen bg-[#020617] flex items-center justify-center text-white">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>

          <h2 className="text-xl font-bold">
            Verifying Security...
          </h2>

          <p className="text-slate-400 mt-2">
            Loading admin panel
          </p>

        </div>

      </div>

    );
  }

  // PREVENT FLICKER
  if (
    !user ||
    !checkAdminAccess(
      user.email
    )
  ) {
    return null;
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white flex pt-16">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="hidden lg:flex w-72 bg-[#0f172a] border-r border-slate-800 flex-col p-6">

        {/* LOGO */}
        <div className="mb-10">

          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">

            Control Center

          </h1>

          <p className="text-sm text-slate-500 mt-2">

            Professional SaaS Admin Panel

          </p>

        </div>

        {/* NAVIGATION */}
        <div className="space-y-3">

          <button
            onClick={() =>
              setActiveTab(
                "overview"
              )
            }
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab ===
              "overview"
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            📊 Overview
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "logs"
              )
            }
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab ===
              "logs"
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔐 Auth Logs
          </button>

        </div>

        {/* ADMIN CARD */}
        <div className="mt-auto bg-slate-900 border border-slate-800 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <img
              src={
                user.photoURL ||
                "https://ui-avatars.com/api/?name=Admin"
              }
              alt="admin"
              className="w-14 h-14 rounded-full object-cover"
            />

            <div>

              <h3 className="font-bold">
                {user.displayName ||
                  "Admin"}
              </h3>

              <p className="text-xs text-slate-400 truncate max-w-[160px]">
                {user.email}
              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="mt-5 w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition font-semibold"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 overflow-y-auto p-6 md:p-10">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">

          <div>

            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">

              Admin Dashboard

            </h1>

            <p className="text-slate-400 mt-3">

              System monitoring, analytics & security logs

            </p>

          </div>

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={
                fetchAdminData
              }
              className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition font-semibold"
            >
              Refresh Data
            </button>

            <Link href="/dashboard">

              <button className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:scale-105 transition">

                Dashboard

              </button>

            </Link>

          </div>

        </div>

        {/* =====================================================
            OVERVIEW TAB
        ===================================================== */}

        {activeTab ===
          "overview" && (

          <>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

              <StatCard
                title="Total Users"
                value={stats.users}
                color="text-indigo-400"
              />

              <StatCard
                title="Total Designs"
                value={stats.designs}
                color="text-purple-400"
              />

              <StatCard
                title="Login Events"
                value={stats.logins}
                color="text-green-400"
              />

              <StatCard
                title="System Status"
                value="LIVE"
                color="text-emerald-400"
              />

            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <Link href="/editor">

                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition cursor-pointer">

                  <div className="text-5xl mb-4">
                    🎨
                  </div>

                  <h3 className="text-2xl font-bold mb-2">
                    Open Editor
                  </h3>

                  <p className="text-slate-400 text-sm">
                    Create and manage professional designs.
                  </p>

                </div>

              </Link>

              <Link href="/dashboard">

                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition cursor-pointer">

                  <div className="text-5xl mb-4">
                    📁
                  </div>

                  <h3 className="text-2xl font-bold mb-2">
                    User Dashboard
                  </h3>

                  <p className="text-slate-400 text-sm">
                    Manage projects and user content.
                  </p>

                </div>

              </Link>

              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">

                <div className="text-5xl mb-4">
                  🛡️
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Security Status
                </h3>

                <p className="text-green-400 text-sm font-semibold">
                  All systems operational
                </p>

              </div>

            </div>

          </>

        )}

        {/* =====================================================
            AUTH LOGS TAB
        ===================================================== */}

        {activeTab ===
          "logs" && (

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">

            {/* TABLE HEADER */}
            <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h3 className="font-bold text-2xl text-white">
                  User Access Logs
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  Authentication activity & security monitoring
                </p>

              </div>

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search logs..."
                value={
                  searchQuery
                }
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 text-sm"
              />

            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-widest">

                  <tr>

                    <th className="px-6 py-5">
                      User Email
                    </th>

                    <th className="px-6 py-5">
                      Action
                    </th>

                    <th className="px-6 py-5">
                      Timestamp
                    </th>

                    <th className="px-6 py-5">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/50">

                  {filteredLogs.map(
                    (log) => (

                      <tr
                        key={log.id}
                        className="hover:bg-slate-800/20 transition group"
                      >

                        <td className="px-6 py-5 font-medium text-slate-300 group-hover:text-white transition-colors">

                          {log.email}

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              log.action ===
                              "LOGIN"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >

                            {log.action}

                          </span>

                        </td>

                        <td className="px-6 py-5 text-slate-500 text-sm">

                          {new Date(
                            log.timestamp
                          ).toLocaleString()}

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">

                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                            Success

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* EMPTY STATE */}
            {filteredLogs.length ===
              0 && (

              <div className="p-20 text-center">

                <div className="text-6xl mb-5">
                  🔍
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  No Logs Found
                </h3>

                <p className="text-slate-500">
                  No authentication activity available.
                </p>

              </div>

            )}

          </div>

        )}

      </main>

    </div>

  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {

  return (

    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 group hover:border-slate-600 transition-all duration-300">

      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />

      <p className="text-slate-500 text-xs uppercase tracking-[0.25em] font-black">

        {title}

      </p>

      <h2
        className={`text-5xl font-black mt-4 tracking-tight ${color}`}
      >

        {value}

      </h2>

    </div>

  );
}