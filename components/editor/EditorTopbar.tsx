"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Eye,
  File,
  FolderOpen,
  HelpCircle,
  MoreHorizontal,
  Redo2,
  Save,
  Share2,
  Sparkles,
  Undo2,
  Upload,
  X,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";

export default function EditorTopbar() {
  const [designName, setDesignName] =
    useState("Untitled Design");

  const [isEditingName, setIsEditingName] =
    useState(false);

  const [isFileMenuOpen, setIsFileMenuOpen] =
    useState(false);

  const [isMoreMenuOpen, setIsMoreMenuOpen] =
    useState(false);

  const [isPreviewOpen, setIsPreviewOpen] =
    useState(false);

  const [saved, setSaved] = useState(true);

  const nameInputRef =
    useRef<HTMLInputElement | null>(null);

  const fileMenuRef =
    useRef<HTMLDivElement | null>(null);

  const moreMenuRef =
    useRef<HTMLDivElement | null>(null);

  /*
  ============================================================
  STORE
  ============================================================
  */

  const undo = useEditorStore(
    (state) => state.undo
  );

  const redo = useEditorStore(
    (state) => state.redo
  );

  const canvas = useEditorStore(
    (state) => state.canvas
  );

  /*
  ============================================================
  START EDITING DESIGN NAME
  ============================================================
  */

  const startEditingName = () => {
    setIsEditingName(true);

    setTimeout(() => {
      nameInputRef.current?.focus();

      nameInputRef.current?.select();
    }, 50);
  };

  /*
  ============================================================
  SAVE DESIGN NAME
  ============================================================
  */

  const saveDesignName = () => {
    const cleanName =
      designName.trim();

    if (!cleanName) {
      setDesignName("Untitled Design");
    }

    setIsEditingName(false);

    setSaved(true);
  };

  /*
  ============================================================
  KEYBOARD NAME HANDLER
  ============================================================
  */

  const handleNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      saveDesignName();
    }

    if (e.key === "Escape") {
      e.preventDefault();

      setIsEditingName(false);
    }
  };

  /*
  ============================================================
  EXPORT PNG
  ============================================================
  */

  const exportPNG = () => {
    if (!canvas) {
      console.warn(
        "Canvas is not ready yet."
      );

      return;
    }

    try {
      const dataURL =
        canvas.toDataURL({
          format: "png",
          multiplier: 1,
          quality: 1,
        });

      const link =
        document.createElement("a");

      link.href = dataURL;

      link.download =
        `${designName || "design"}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setSaved(true);
    } catch (error) {
      console.error(
        "Export failed:",
        error
      );
    }
  };

  /*
  ============================================================
  DOWNLOAD JPG
  ============================================================
  */

  const exportJPG = () => {
    if (!canvas) return;

    try {
      const dataURL =
        canvas.toDataURL({
          format: "jpeg",
          multiplier: 1,
          quality: 0.95,
        });

      const link =
        document.createElement("a");

      link.href = dataURL;

      link.download =
        `${designName || "design"}.jpg`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error(
        "JPG export failed:",
        error
      );
    }
  };

  /*
  ============================================================
  PREVIEW
  ============================================================
  */

  const openPreview = () => {
    if (!canvas) return;

    setIsPreviewOpen(true);
  };

  /*
  ============================================================
  CLOSE MENUS WHEN CLICKING OUTSIDE
  ============================================================
  */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        fileMenuRef.current &&
        !fileMenuRef.current.contains(target)
      ) {
        setIsFileMenuOpen(false);
      }

      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(target)
      ) {
        setIsMoreMenuOpen(false);
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

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <>
      <header className="relative z-[100] flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm">

        {/* ==================================================
            LEFT SECTION
        ================================================== */}

        <div className="flex min-w-0 items-center gap-2">

          {/* LOGO */}

          <button
            type="button"
            className="group flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Sparkles size={18} />
            </div>

            <div className="hidden text-left sm:block">

              <p className="text-sm font-bold leading-none text-slate-900">
                Mini Canva
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                AI Design Studio
              </p>

            </div>

          </button>

          <div className="mx-1 hidden h-7 w-px bg-slate-200 md:block" />

          {/* FILE MENU */}

          <div
            ref={fileMenuRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setIsFileMenuOpen(
                  (value) => !value
                )
              }
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:flex"
            >
              <File size={16} />

              File

              <ChevronDown size={14} />
            </button>

            {isFileMenuOpen && (
              <div className="absolute left-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setIsFileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <File size={16} />

                  New design
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FolderOpen size={16} />

                  Open design
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFileMenuOpenSafe(
                      setIsFileMenuOpen
                    );
                   }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Upload size={16} />

                  Import
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    exportPNG();

                    setIsFileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Download size={16} />

                  Export PNG
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportJPG();

                    setIsFileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Download size={16} />

                  Export JPG
                </button>

              </div>
            )}

          </div>

          {/* DESIGN NAME */}

          <div className="ml-1 min-w-0">

            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={designName}
                onChange={(e) => {
                  setDesignName(
                    e.target.value
                  );

                  setSaved(false);
                }}
                onBlur={saveDesignName}
                onKeyDown={
                  handleNameKeyDown
                }
                className="w-40 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900 outline-none ring-2 ring-slate-200 focus:border-slate-400"
              />
            ) : (
              <button
                type="button"
                onClick={startEditingName}
                title="Rename design"
                className="max-w-44 truncate rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {designName}
              </button>
            )}

          </div>

          {/* SAVE STATUS */}

          <div className="hidden items-center gap-1 text-xs text-slate-400 lg:flex">

            {saved ? (
              <>
                <Check size={13} />

                Saved
              </>
            ) : (
              <>
                <Save size={13} />

                Unsaved
              </>
            )}

          </div>

        </div>

        {/* ==================================================
            CENTER
        ================================================== */}

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">

          {/* UNDO */}

          <button
            type="button"
            onClick={() => undo()}
            title="Undo (Ctrl + Z)"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Undo2 size={18} />
          </button>

          {/* REDO */}

          <button
            type="button"
            onClick={() => redo()}
            title="Redo (Ctrl + Y)"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Redo2 size={18} />
          </button>

        </div>

        {/* ==================================================
            RIGHT SECTION
        ================================================== */}

        <div className="ml-auto flex items-center gap-1.5">

          {/* HELP */}

          <button
            type="button"
            title="Help"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <HelpCircle size={18} />
          </button>

          {/* AI */}

          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:flex"
          >
            <Sparkles size={16} />

            AI
          </button>

          {/* PREVIEW */}

          <button
            type="button"
            onClick={openPreview}
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:flex"
          >
            <Eye size={16} />

            Preview
          </button>

          {/* SHARE */}

          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex"
          >
            <Share2 size={16} />

            Share
          </button>

          {/* EXPORT */}

          <button
            type="button"
            onClick={exportPNG}
            className="flex items-center gap-2 rounded-lg bg-black px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Download size={16} />

            <span className="hidden sm:inline">
              Export
            </span>
          </button>

          {/* MORE */}

          <div
            ref={moreMenuRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setIsMoreMenuOpen(
                  (value) => !value
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <MoreHorizontal size={19} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    exportPNG();

                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Download size={16} />

                  Download PNG
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportJPG();

                    setIsMoreMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Download size={16} />

                  Download JPG
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Share2 size={16} />

                  Share design
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* ====================================================
          PREVIEW MODAL
      ==================================================== */}

      {isPreviewOpen && canvas && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-8">

          <div className="relative flex max-h-full max-w-full flex-col items-center">

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setIsPreviewOpen(false)
              }
              className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            {/* PREVIEW */}

            <div className="max-h-[80vh] max-w-[80vw] overflow-auto rounded-lg bg-white p-2 shadow-2xl">

              <img
                src={canvas.toDataURL({
                  format: "png",
                  multiplier: 1,
                })}
                alt="Design preview"
                className="block max-h-[75vh] max-w-[75vw] object-contain"
              />

            </div>

            {/* BOTTOM */}

            <div className="mt-4 flex items-center gap-3">

              <span className="text-sm text-white/80">
                {designName}
              </span>

              <button
                type="button"
                onClick={exportPNG}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                <Download size={16} />

                Download
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

/*
============================================================
SMALL SAFE HELPER
============================================================
*/

function setIsFileMenuOpenSafe(
  setter: React.Dispatch<
    React.SetStateAction<boolean>
  >
) {
  setter(false);
}

