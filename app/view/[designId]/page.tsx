"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2, ExternalLink, ArrowLeft, Download } from "lucide-react";
import { getDesignById, updateDesign } from "@/lib/db-operations";
import * as fabric from "fabric";
import Link from "next/link";

interface DesignData {
  id: string;
  title: string;
  width: number;
  height: number;
  isPublic: boolean;
  pages: { id: string; name: string; json: string }[];
  thumbnail: string | null;
  views: number;
}

export default function ViewDesignPage() {
  const { designId } = useParams<{ designId: string }>();
  const [design, setDesign] = useState<DesignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!designId) return;

    const fetchDesign = async () => {
      try {
        const data = await getDesignById(designId);
        if (!data) {
          setError("Design not found");
          return;
        }
        if (!data.isPublic) {
          setError("This design is private");
          return;
        }

        setDesign(data as DesignData);

        // Increment view count
        await updateDesign(designId, { views: (data.views || 0) + 1 }).catch(() => {});
      } catch {
        setError("Failed to load design");
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designId]);

  useEffect(() => {
    if (!design || !canvasRef.current) return;

    let cancelled = false;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: design.width,
      height: design.height,
      selection: false,
      renderOnAddRemove: true,
    });

    fabricRef.current = canvas;

    const page = design.pages?.find((p) => p.id === design.pages[0]?.id) || design.pages?.[0];
    if (page?.json) {
      try {
        const json =
          typeof page.json === "string"
            ? JSON.parse(page.json)
            : page.json;
        canvas.loadFromJSON(json).then(() => {
          if (cancelled) return;
          canvas.requestRenderAll();
          const container = canvasRef.current?.parentElement;
          if (container) {
            const maxWidth = container.clientWidth - 40;
            const scale = Math.min(maxWidth / design.width, 1);
            canvas.setZoom(scale);
            canvas.setDimensions({
              width: design.width * scale,
              height: design.height * scale,
            });
            canvas.requestRenderAll();
          }
        });
      } catch {
        // JSON parse error — design won't render but no setState needed
      }
    }

    return () => {
      cancelled = true;
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [design]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = `${design?.title || "design"}.png`;
    link.href = dataURL;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
          <p className="text-slate-500">Loading design...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{error}</h1>
          <p className="text-slate-500 mb-6">
            {error === "This design is private"
              ? "The owner hasn't made this design public yet."
              : "The design you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={18} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900">{design?.title}</h1>
              <p className="text-xs text-slate-500">
                {design?.width} × {design?.height}px · Public
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/editor/${designId}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
            >
              <ExternalLink size={16} />
              Edit
            </Link>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
