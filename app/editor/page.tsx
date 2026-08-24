"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createDesign, getUserDesigns } from "@/lib/db-operations";

export default function EditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (working) return;

    setWorking(true);

    (async () => {
      try {
        // Resume the most recently edited design; create a new one only
        // when the user has nothing to resume.
        const designs = await getUserDesigns(user.uid);
        const active = designs.filter((d) => !d.deletedAt && !d.templateId);

        let latest: (typeof active)[number] | null = null;
        for (const d of active) {
          if (
            !latest ||
            new Date(d.updatedAt).getTime() > new Date(latest.updatedAt).getTime()
          ) {
            latest = d;
          }
        }

        if (latest) {
          router.replace(`/editor/${latest.id}`);
          return;
        }

        const design = await createDesign(user.uid, "Untitled Design", 1080, 1080);
        router.replace(`/editor/${design.id}`);
      } catch (error) {
        console.error("Failed to open editor:", error);
        router.replace("/dashboard");
      }
    })();
  }, [authLoading, user, working, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin mr-2 text-indigo-600" size={28} />
      <span className="text-slate-600">Opening your design...</span>
    </div>
  );
}
