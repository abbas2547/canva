"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createDesign } from "@/lib/db-operations";

export default function EditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (creating) return;

    setCreating(true);

    (async () => {
      try {
        const design = await createDesign(user.uid, "Untitled Design", 1080, 1080);
        router.replace(`/editor/${design.id}`);
      } catch (error) {
        console.error("Failed to create design:", error);
        router.replace("/dashboard");
      }
    })();
  }, [authLoading, user, creating, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin mr-2 text-indigo-600" size={28} />
      <span className="text-slate-600">Creating your design...</span>
    </div>
  );
}
