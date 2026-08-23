"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import EditorLayout from "@/components/editor/EditorLayout";
import { useAuth } from "@/context/AuthContext";

interface DesignParams {
  [key: string]: string;
}

export default function EditorPage() {
  const { designId } = useParams<DesignParams>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!designId) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [authLoading, user, designId, router]);

  if (authLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin mr-2 text-indigo-600" size={28} />
        <span className="text-slate-600">Loading your workspace...</span>
      </div>
    );
  }

  return <EditorLayout initialDesignId={designId} />;
}
