"use client";

import {
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";

import {
  Image as ImageIcon,
  Loader2,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

import * as fabric from "fabric";
import { useEditorStore } from "@/store/editorStore";
import toast from "react-hot-toast";

/* =========================================================
   TYPES
======================================================= */

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  src: {
    medium: string;
    large2x: string;
    large: string;
    original: string;
  };
  url: string;
  photographer: string;
  alt: string;
};

type PexelsResponse = {
  photos: PexelsPhoto[];
  page: number;
  per_page: number;
  total_results: number;
  next_page: string | null;
  error?: string;
};

/* =========================================================
   COMPONENT
======================================================= */

export default function ImagesPanel() {
  const canvas = useEditorStore(
    (state) => state.canvas
  );
  const saveHistory = useEditorStore(
    (state) => state.saveHistory
  );
  const refreshLayers = useEditorStore(
    (state) => state.refreshLayers
  );

  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* =========================================================
     SEARCH IMAGES
  ======================================================= */

  const searchImages = useCallback(
    async (query: string, pageNum: number, replace = false) => {
      if (!isMounted.current) return;

      const cleanQuery = query.trim() || "nature";

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/ai-chat/images?query=${encodeURIComponent(
            cleanQuery
          )}&page=${pageNum}&per_page=24`,
          { method: "GET", cache: "no-store" }
        );

        const text = await response.text();
        let data: PexelsResponse = {
          photos: [],
          page: pageNum,
          per_page: 24,
          total_results: 0,
          next_page: null,
        };

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {
            photos: [],
            page: pageNum,
            per_page: 24,
            total_results: 0,
            next_page: null,
          };
        }

        if (!response.ok || data.error) {
          throw new Error(data.error || `Image search failed (${response.status})`);
        }

        if (isMounted.current) {
          setPhotos((prev) =>
            replace ? (data.photos || []) : [...prev, ...(data.photos || [])]
          );
          setHasMore((data.photos || []).length >= 24);
          setPage(data.page || pageNum);
          setLoading(false);
        }
      } catch (searchError) {
        if (isMounted.current) {
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Failed to load images"
          );
          setLoading(false);
        }
      }
    },
    []
  );

  /* =========================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    searchImages("nature", 1, true);
  }, [searchImages]);

  /* =========================================================
     ADD IMAGE TO CANVAS
  ======================================================= */

  const addImageToCanvas = useCallback(
    async (photo: PexelsPhoto) => {
      if (!canvas) {
        toast.error("Canvas is not ready");
        return;
      }

      try {
        toast.loading("Adding image...", { id: "add-image" });

        const imgElement = await loadImage(photo.src.large2x || photo.src.large || photo.src.medium);

        if (!isMounted.current) return;

        const fabricImage = new fabric.FabricImage(imgElement, {
          left: 100,
          top: 100,
        });

        const maxSize = 400;
        const scale = Math.min(
          maxSize / (imgElement.naturalWidth || imgElement.width),
          maxSize / (imgElement.naturalHeight || imgElement.height),
          1
        );

        fabricImage.scale(scale);
        fabricImage.set({
          left: (canvas.getWidth() / 2) - (fabricImage.getScaledWidth() / 2),
          top: (canvas.getHeight() / 2) - (fabricImage.getScaledHeight() / 2),
        });

        canvas.add(fabricImage);
        canvas.setActiveObject(fabricImage);
        canvas.renderAll();
        saveHistory();
        refreshLayers();
        toast.success("Image added!", { id: "add-image" });
      } catch (err) {
        console.error("Failed to add image:", err);
        toast.error("Failed to add image", { id: "add-image" });
      }
    },
    [canvas, saveHistory, refreshLayers]
  );

  /* =========================================================
     UI
  ======================================================= */

  return (
    <div className="flex flex-col h-full">
      {/* SEARCH */}
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchImages(searchQuery, 1, true);
              }
            }}
            placeholder="Search Pexels photos..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchImages("nature", 1, true);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => searchImages(searchQuery, 1, true)}
          disabled={loading}
          className="mt-2 w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {/* RESULTS */}
      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="text-center py-8 text-sm text-red-500">
            {error}
            <button
              onClick={() => searchImages(searchQuery || "nature", 1, true)}
              className="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => addImageToCanvas(photo)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 transition hover:border-indigo-400 hover:shadow-md"
            >
              <img
                src={photo.src.medium}
                alt={photo.alt || "Pexels photo"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">
                  + Add
                </div>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        )}

        {!loading && photos.length === 0 && !error && (
          <div className="text-center py-12 text-slate-400">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No images found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}

        {/* LOAD MORE */}
        {hasMore && photos.length > 0 && !loading && (
          <button
            onClick={() => searchImages(searchQuery || "nature", page + 1, false)}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <ChevronDown size={16} />
            Load More
          </button>
        )}

        {/* ATTRIBUTION */}
        {photos.length > 0 && (
          <p className="text-center text-[10px] text-slate-400 mt-4">
            Photos by Pexels
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
======================================================= */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
