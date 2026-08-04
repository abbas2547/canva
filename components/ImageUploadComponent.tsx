"use client";

import { ChangeEvent, useState } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadFileToStorage, updateUserStorage } from "@/lib/db-operations";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUpload?: (url: string) => void;
  maxSize?: number; // in MB
}

export default function ImageUpload({ onUpload, maxSize = 10 }: ImageUploadProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      setUploading(true);
      const url = await uploadFileToStorage(user.uid, file, "uploads");
      
      // Update user storage usage
      await updateUserStorage(user.uid, file.size);
      
      setUploadedImages((prev) => [...prev, url]);
      toast.success("Image uploaded successfully");
      onUpload?.(url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader className="h-8 w-8 text-indigo-400 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
          <p className="text-sm font-medium text-white">
            {uploading ? "Uploading..." : "Drop image here or click to upload"}
          </p>
          <p className="text-xs text-slate-400">
            PNG, JPG, WebP up to {maxSize}MB
          </p>
        </div>
      </label>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-white mb-3">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((url) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt="Uploaded"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setUploadedImages((prev) => prev.filter((u) => u !== url));
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
