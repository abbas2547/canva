"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, LogOut, Trash2, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ displayName: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user?.displayName) {
      setFormData({ displayName: user.displayName });
    }
  }, [user, loading, router]);

  const handleSaveProfile = async () => {
    if (!formData.displayName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ displayName: formData.displayName });
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Account Settings</h1>

        {/* Profile Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300">
                <Mail className="h-5 w-5" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Display Name</label>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ displayName: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {saving ? "Saving..." : <><Check className="h-5 w-5" /> Save</>}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <span className="text-slate-300">{user.displayName || "Not set"}</span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Subscription Status */}
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">Current Plan</label>
              <div className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                <p className="text-slate-300 capitalize">{user.subscriptionPlan || "free"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Delete Account</h3>
              <p className="text-slate-400 mb-6">
                This action cannot be undone. All your designs and data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.error("Account deletion not yet implemented");
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}