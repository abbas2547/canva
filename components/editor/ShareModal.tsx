"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Globe,
  Lock,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import type { ShareMember, ShareRole, ShareVisibility } from "@/types/sharing";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string | null;
}

export default function ShareModal({ isOpen, onClose, designId }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>("private");
  const [members, setMembers] = useState<ShareMember[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<ShareRole>("viewer");
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !designId) return;

    let cancelled = false;
    async function fetchDesign() {
      setLoading(true);
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/designs/${designId}/share`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json() as { sharing?: { visibility: ShareVisibility; members: ShareMember[] }; error?: string };
        if (!response.ok) throw new Error(data.error || "Failed to load share settings");
        if (!cancelled && data.sharing) {
          setVisibility(data.sharing.visibility);
          setIsPublic(data.sharing.visibility === "link");
          setMembers(data.sharing.members);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load share settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDesign();
    return () => { cancelled = true; };
  }, [isOpen, designId, user?.uid]);

  const togglePublic = async () => {
    if (!designId) return;
    setToggling(true);
    try {
      if (!user) throw new Error("Authentication required.");
      const nextVisibility: ShareVisibility = visibility === "link" ? "private" : "link";
      const token = await user.getIdToken();
      const response = await fetch(`/api/designs/${designId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visibility: nextVisibility, members }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to update sharing");
      setVisibility(nextVisibility);
      setIsPublic(nextVisibility === "link");
      toast.success(nextVisibility === "link" ? "Anyone with the link can view" : "Design is now private");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update sharing");
    } finally {
      setToggling(false);
    }
  };

  const saveSpecificAccess = async () => {
    if (!designId || !user) return;
    const email = memberEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    const nextMembers = [...members.filter((member) => member.email !== email), { email, role: memberRole }];
    setToggling(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/designs/${designId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visibility: "specific", members: nextMembers }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to save access");
      setMembers(nextMembers);
      setVisibility("specific");
      setIsPublic(false);
      setMemberEmail("");
      toast.success("Specific-user access saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save access");
    } finally {
      setToggling(false);
    }
  };

  const removeMember = async (email: string) => {
    if (!designId || !user) return;
    const nextMembers = members.filter((member) => member.email !== email);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/designs/${designId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visibility: nextMembers.length ? "specific" : "private", members: nextMembers }),
      });
      if (!response.ok) throw new Error("Failed to remove member");
      setMembers(nextMembers);
      setVisibility(nextMembers.length ? "specific" : "private");
      toast.success("Access removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const getShareLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/view/${designId}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareLink());
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareTwitter = () => {
    const link = getShareLink();
    window.open(
      `https://twitter.com/intent/tweet?text=Check%20out%20my%20design&url=${encodeURIComponent(link)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    const link = getShareLink();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Share2 className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Share design</h2>
                  <p className="text-xs text-slate-500">Manage who can view your design</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Public Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isPublic ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe className="text-green-600" size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <Lock className="text-slate-500" size={20} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {isPublic ? "Public access" : "Private"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isPublic
                            ? "Anyone with the link can view"
                            : "Only you can access this design"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={togglePublic}
                      disabled={toggling}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isPublic ? "bg-green-600" : "bg-slate-300"
                      } ${toggling ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isPublic ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {visibility === "specific" && (
                    <div className="space-y-3">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">People with access</label>
                      {members.map((member) => (
                        <div key={member.email} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                          <div><p className="text-sm text-slate-700">{member.email}</p><p className="text-xs capitalize text-slate-400">{member.role}</p></div>
                          <button type="button" onClick={() => void removeMember(member.email)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="name@example.com" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                        <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as ShareRole)} className="rounded-lg border border-slate-200 px-2 text-sm">
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => void saveSpecificAccess()} disabled={toggling} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Add person</button>
                    </div>
                  )}

                  {/* Share Link */}
                  {visibility === "link" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                        Shareable link
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                          <ExternalLink size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-600 truncate">
                            {getShareLink()}
                          </span>
                        </div>
                        <button
                          onClick={copyLink}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                            copied
                              ? "bg-green-100 text-green-700"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>

                      {/* Social Share */}
                      <div className="mt-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                          Share on social media
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={shareTwitter}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2] text-white rounded-lg text-sm font-medium hover:bg-[#1a8cd8] transition"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            Twitter
                          </button>
                          <button
                            onClick={shareFacebook}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#4267B2] text-white rounded-lg text-sm font-medium hover:bg-[#365899] transition"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
