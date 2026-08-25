"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { addUploadedImageToCanvas, placeImageOnCanvas } from "@/lib/image-upload";

export default function UploadsPanel() {
  const [uploads, setUploads] = useState<
    Array<{ id: string; url: string; name: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const { user } = useAuth();

  const handleUpload = async (file: File) => {
    if (!canvas) {
      toast.error("Canvas is not ready yet.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Please choose a PNG, JPG, WebP, or GIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Images must be smaller than 10MB.");
      return;
    }

    if (isUploading) return;
    setIsUploading(true);
    const toastId = toast.loading("Processing image...");
    try {
      const result = await addUploadedImageToCanvas(canvas, user?.uid ?? "", file);

      canvas.setActiveObject(result.image);
      canvas.requestRenderAll();
      saveHistory();

      if (result.stored) {
        toast.success("Image uploaded", { id: toastId });
      } else {
        toast.success("Image added", { id: toastId });
      }

      setUploads((prev) => [
        ...prev,
        { id: Date.now().toString(), url: result.url, name: file.name },
      ]);
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add image",
        { id: toastId }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload Area */}
      <div className="p-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Upload size={20} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Upload images
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag & drop or click to browse
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              PNG, JPG, WebP, GIF up to 10MB
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {/* Uploaded Images Grid */}
      {uploads.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Your Uploads
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200"
              >
                <img
                  src={upload.url}
                  alt={upload.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={async () => {
                      if (!canvas) return;
                      try {
                        const image = await placeImageOnCanvas(canvas, upload.url, 400);
                        canvas.setActiveObject(image);
                        canvas.requestRenderAll();
                        useEditorStore.getState().refreshLayers();
                        saveHistory();
                      } catch (error) {
                        console.error("Error re-adding image:", error);
                        toast.error("Failed to add image");
                      }
                    }}
                    className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white"
                  >
                    <ImageIcon size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setUploads((prev) =>
                        prev.filter((u) => u.id !== upload.id)
                      )
                    }
                    className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploads.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ImageIcon
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm text-slate-500">No uploads yet</p>
            <p className="text-xs text-slate-400">
              Your uploaded images will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
