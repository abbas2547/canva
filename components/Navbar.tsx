"use client";

import Link from "next/link";
import Image from "next/image";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useRouter,
  usePathname,
} from "next/navigation";

import {
  useState,
  useRef,
  useEffect,
} from "react";
import InstallPWAButton from "./InstallPWAButton";

export default function Navbar() {

  const {
    user,
    logout,
    role,
    subscriptionPlan,
    subscriptionLoading,
    loading,
  } = useAuth();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // CLOSE PROFILE DROPDOWN
  useEffect(() => {

    const handleClickOutside = (
      event: MouseEvent
    ) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {

        setProfileOpen(false);

      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // LOGOUT
  const handleLogout =
    async () => {

      try {
        // FIREBASE LOGOUT
        await logout();

        router.push("/");

      } catch (error) {

        console.error(
          "Logout failed:",
          error
        );

      }
    };

  // ACTIVE NAV STYLE
  const navLink = (
    path: string
  ) => {

    return pathname ===
      path
      ? "nav-link nav-active text-indigo-600 font-semibold"
      : "nav-link text-slate-800 hover:text-indigo-600";

  };

  return (
    <nav className={`site-nav fixed top-0 left-0 w-full z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl ${scrolled ? "site-nav-scrolled" : ""}`}>

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >

          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">

            <Image
              src="/logo.svg"
              alt="Mini Canva AI logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />

          </div>

          <div className="hidden sm:block">

            <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">

              Mini Canva AI

            </h1>

            <p className="text-[10px] text-slate-400 -mt-1">

              Professional SaaS Studio

            </p>

          </div>

        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">

          <Link
            href="/"
            className={`${navLink("/")} transition`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className={`${navLink("/dashboard")} transition`}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
          >
            Dashboard
          </Link>

          <Link
            href="/editor"
            className={`${navLink("/editor")} transition`}
            aria-current={pathname === "/editor" ? "page" : undefined}
          >
            Editor
          </Link>

          {role ===
            "admin" && (

            <Link
              href="/admin"
              className={`${navLink("/admin")} transition`}
              aria-current={pathname === "/admin" ? "page" : undefined}
            >
              Admin
            </Link>

          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && <InstallPWAButton />}

          {loading || subscriptionLoading ? (

            <div className="flex items-center gap-3">

              <div className="w-20 h-10 rounded-xl bg-white/5 animate-pulse" />

              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />

            </div>

          ) : user ? (

            <div
              className="flex items-center gap-3"
            >
              {subscriptionPlan === "free" ? (
                <Link
                  href="/pricing"
                  className="hidden lg:inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                >
                  ✨ Upgrade Plan
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="hidden lg:inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100"
                >
                  Current Plan: {subscriptionPlan}
                </Link>
              )}
            <div
              className="relative"
              ref={profileRef}
            >

              {/* PROFILE BUTTON */}
              <button
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/60 px-3 py-2 transition-all"
              >

                {/* IMAGE */}
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${user.displayName || "User"}`
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                />

                {/* USER INFO */}
                <div className="text-left">

                  <p className="text-sm font-semibold text-slate-900 leading-none">

                    {user.displayName ||
                      "User"}

                  </p>

                  <p className="text-xs text-slate-400 mt-1 capitalize">

                    {role || "user"}

                  </p>

                </div>

                {/* ARROW */}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >

                  <path d="M19 9l-7 7-7-7" />

                </svg>

              </button>

              {/* DROPDOWN */}
              {profileOpen && (

                <div className="dropdown-enter absolute right-0 mt-3 w-72 rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-300/30 overflow-hidden">

                  {/* HEADER */}
                  <div className="p-5 border-b border-white/5">

                    <div className="flex items-center gap-4">

                      <img
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${user.displayName || "User"}`
                        }
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                      />

                      <div className="min-w-0">

                        <h3 className="font-bold text-white truncate">

                          {user.displayName ||
                            "Mini Canva User"}

                        </h3>

                        <p className="text-sm text-slate-400 truncate">

                          {user.email}

                        </p>

                        <span className="inline-flex mt-2 px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 capitalize">

                          {role || "user"}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* MENU */}
                  <div className="p-2">

                    <Link
                      href="/dashboard"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-indigo-50 transition text-sm text-slate-700"
                    >
                      📊 Dashboard
                    </Link>

                    <Link
                      href="/editor"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-indigo-50 transition text-sm text-slate-700"
                    >
                      🎨 Editor
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-indigo-50 transition text-sm text-slate-700"
                    >
                      👤 Profile
                    </Link>

         
                  </div>

                  {/* FOOTER */}
                  <div className="p-3 border-t border-white/5">

                    <button
                      onClick={
                        handleLogout
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition font-semibold"
                    >
                      🚪 Logout
                    </button>

                  </div>

                </div>

              )}

            </div>

            </div>

          ) : (

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 transition text-sm font-semibold text-slate-700"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                Get Started
              </Link>

            </div>

          )}

        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 shadow-sm transition hover:bg-indigo-100"
        >

          <span className="w-6 h-0.5 bg-slate-800 rounded-full"></span>

          <span className="w-6 h-0.5 bg-slate-800 rounded-full"></span>

          <span className="w-6 h-0.5 bg-slate-800 rounded-full"></span>

        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (

        <div className="mobile-menu-enter md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-6 space-y-5 shadow-xl shadow-slate-200/40">
          {!loading && <InstallPWAButton />}

          <Link
            href="/"
            className={`mobile-nav-link ${navLink("/")}`}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className={`mobile-nav-link ${navLink("/dashboard")}`}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Dashboard
          </Link>

          <Link
            href="/editor"
            className={`mobile-nav-link ${navLink("/editor")}`}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Editor
          </Link>

          {role ===
            "admin" && (

            <Link
              href="/admin"
              className={`mobile-nav-link ${navLink("/admin")}`}
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Admin
            </Link>

          )}

          {user ? (

            <>
              <Link
                href="/profile"
                className={`mobile-nav-link ${navLink("/profile")}`}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Profile
              </Link>

              <button
                onClick={() => {

                  setMenuOpen(false);

                  handleLogout();

                }}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold"
              >
                Logout
              </button>
            </>

          ) : (

            <div className="flex flex-col gap-3">

              <Link
                href="/login"
                className="block w-full text-center py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Get Started
              </Link>

            </div>

          )}

        </div>

      )}

    </nav>
  );
}