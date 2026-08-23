"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect after auth check is complete and there's no user, and we haven't redirected yet
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/login");
    }
  }, [user, loading]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If no user, don't render children (redirecting)
  if (!user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}