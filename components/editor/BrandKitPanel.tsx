"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, Palette, Plus, Trash2, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useEditorStore } from "@/store/editorStore";
import { uploadFileToStorage } from "@/lib/db-operations";
import type { BrandKit } from "@/types/brand-kit";
import { hasFeature } from "@/lib/subscription";

const fonts = ["Arial", "Georgia", "Helvetica", "Inter", "Poppins", "Roboto", "Times New Roman"];

export default function BrandKitPanel() {
  const { user, subscriptionPlan } = useAuth();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [colors, setColors] = useState<string[]>(["#6366f1", "#0f172a", "#ffffff"]);
  const [primaryFont, setPrimaryFont] = useState("Arial");
  const [secondaryFont, setSecondaryFont] = useState("Arial");
  const [newColor, setNewColor] = useState("#14b8a6");
  const canUseBrandKit = hasFeature(subscriptionPlan, "brandKit");
  const isBusiness = subscriptionPlan === "business";

  const setForm = useCallback((kit: BrandKit) => {
    setName(kit.name);
    setLogoUrl(kit.logoUrl);
    setColors(kit.colors);
    setPrimaryFont(kit.primaryFont);
    setSecondaryFont(kit.secondaryFont);
  }, []);

  const authHeaders = useCallback(async () => {
    if (!user) throw new Error("Authentication required.");
    return { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" };
  }, [user]);

  const loadKits = useCallback(async () => {
    try {
      const response = await fetch("/api/brand-kits", { headers: await authHeaders(), cache: "no-store" });
      const result = (await response.json()) as { success?: boolean; brandKits?: BrandKit[]; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to load Brand Kits.");
      setKits(result.brandKits || []);
      const first = result.brandKits?.[0];
      if (first) {
        setSelectedId(first.id);
        setForm(first);
      }
    } catch (error) {
      console.error("Brand kit load error:", error);
      toast.error(error instanceof Error ? error.message : "Unable to load Brand Kits.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, setForm]);

  useEffect(() => {
    if (!canUseBrandKit) {
      return;
    }
    const timer = window.setTimeout(() => void loadKits(), 0);
    return () => window.clearTimeout(timer);
  }, [canUseBrandKit, loadKits]);

  const selectedKit = useMemo(() => kits.find((kit) => kit.id === selectedId), [kits, selectedId]);

  const startNew = () => {
    setSelectedId("");
    setName("");
    setLogoUrl("");
    setColors(["#6366f1", "#0f172a", "#ffffff"]);
    setPrimaryFont("Arial");
    setSecondaryFont("Arial");
  };

  const saveKit = async () => {
    if (!name.trim()) {
      toast.error("Enter a Brand name.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch("/api/brand-kits", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ id: selectedId || undefined, name, logoUrl, colors, primaryFont, secondaryFont }),
      });
      const result = (await response.json()) as { success?: boolean; brandKit?: BrandKit; error?: string };
      if (!response.ok || !result.success || !result.brandKit) throw new Error(result.error || "Unable to save Brand Kit.");
      setKits((current) => {
        const withoutCurrent = current.filter((kit) => kit.id !== result.brandKit?.id);
        return [...withoutCurrent, result.brandKit as BrandKit];
      });
      setSelectedId(result.brandKit.id);
      toast.success("Brand Kit saved.");
    } catch (error) {
      console.error("Brand kit save error:", error);
      toast.error(error instanceof Error ? error.message : "Unable to save Brand Kit.");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      setLogoUrl(await uploadFileToStorage(user?.uid || "", file, "brand-kits"));
      toast.success("Logo uploaded.");
    } catch (error) {
      console.error("Brand logo upload error:", error);
      toast.error("Logo upload failed.");
    }
  };

  const applyBrand = () => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas || !selectedKit) return;
    if (!window.confirm("Apply this Brand Kit to editable text and design elements?")) return;
    let colorIndex = 0;
    canvas.getObjects().forEach((object) => {
      const type = object.type;
      if (type === "i-text" || type === "textbox" || type === "text") {
        object.set({ fontFamily: selectedKit.primaryFont, fill: selectedKit.colors[colorIndex % selectedKit.colors.length] });
        colorIndex += 1;
      } else if (type === "rect" || type === "circle" || type === "triangle" || type === "polygon") {
        object.set({ fill: selectedKit.colors[colorIndex % selectedKit.colors.length] });
        colorIndex += 1;
      }
    });
    canvas.requestRenderAll();
    useEditorStore.getState().refreshLayers();
    useEditorStore.getState().saveHistory();
    toast.success("Brand applied to your design.");
  };

  if (!canUseBrandKit) {
    return <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"><Palette className="text-indigo-500" /><p className="text-sm font-semibold text-slate-800">Brand Kit is available on Pro.</p><p className="text-xs text-slate-500">Upgrade to save colors, fonts, and logos for your designs.</p></div>;
  }
  if (loading) return <div className="p-4 text-sm text-slate-500">Loading Brand Kits...</div>;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      <div className="mb-3 flex items-center gap-2">
        <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); const kit = kits.find((item) => item.id === event.target.value); if (kit) setForm(kit); }} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800">
          <option value="">New Brand Kit</option>
          {kits.map((kit) => <option key={kit.id} value={kit.id}>{kit.name}</option>)}
        </select>
        {isBusiness && <button type="button" onClick={startNew} title="New Brand Kit" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Plus size={15} /></button>}
      </div>
      <div className="space-y-3">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Brand name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500" />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 hover:border-indigo-300">
          <ImagePlus size={15} /> {logoUrl ? "Change logo" : "Upload logo"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file); }} />
        </label>
        {logoUrl && <img src={logoUrl} alt="Brand logo" className="h-14 max-w-full rounded border border-slate-200 object-contain p-1" />}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Palette size={13} /> Brand colors</p>
          <div className="flex flex-wrap gap-2">{colors.map((color) => <button key={color} type="button" title={`Remove ${color}`} onClick={() => setColors((current) => current.filter((item) => item !== color))} className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-slate-200" style={{ backgroundColor: color }}><Trash2 size={12} className="mx-auto hidden text-white drop-shadow group-hover:block" /></button>)}</div>
          <div className="mt-2 flex gap-2"><input type="color" value={newColor} onChange={(event) => setNewColor(event.target.value)} className="h-8 w-10 rounded border border-slate-200" /><button type="button" onClick={() => { if (!colors.includes(newColor)) setColors((current) => [...current, newColor].slice(0, 12)); }} className="rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">Add color</button></div>
        </div>
        <label className="block text-xs font-semibold text-slate-500">Primary font<select value={primaryFont} onChange={(event) => setPrimaryFont(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800">{fonts.map((font) => <option key={font}>{font}</option>)}</select></label>
        <label className="block text-xs font-semibold text-slate-500">Secondary font<select value={secondaryFont} onChange={(event) => setSecondaryFont(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800">{fonts.map((font) => <option key={font}>{font}</option>)}</select></label>
        <div className="flex gap-2 pt-1"><button type="button" onClick={() => void saveKit()} disabled={saving} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? "Saving..." : "Save Brand Kit"}</button><button type="button" onClick={applyBrand} disabled={!selectedKit || !colors.length} className="flex items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 disabled:opacity-50"><Wand2 size={14} /> Apply Brand</button></div>
        {selectedKit && <p className="text-[11px] text-slate-500">Applies saved colors and primary font to editable elements. Existing objects remain editable.</p>}
      </div>
    </div>
  );
}
