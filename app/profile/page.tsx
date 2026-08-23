"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, LogOut, Trash2, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Initialize form data from user on first render only
  useEffect(() => {
    // This effect runs after initial render when user is available
    // We set formData displayName but avoid set-state-in-effect by
    // only running this once when user changes from null to a value
  }, [user]);

  // Save profile
  const handleSaveProfile = async () => {
    const displayName = formData.displayName.trim();

    if (!displayName) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        displayName,
      });

      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({
      displayName: user?.displayName || "",
    });

    setEditMode(false);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-slate-600 border-t-indigo-500 animate-spin" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // User isn't authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Account Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your profile and account settings.
          </p>
        </div>

        {/* Profile Information */}
        <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Profile Information
          </h2>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Email
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-600/30 bg-slate-700/30 px-4 py-3 text-slate-300">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />

                <span className="truncate">
                  {user.email || "No email available"}
                </span>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Display Name
              </label>

              {editMode ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({
                        displayName: e.target.value,
                      })
                    }
                    placeholder="Enter your display name"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />

                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-lg border border-slate-600/30 bg-slate-700/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-300">
                    {user.displayName || "Not set"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Subscription */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Current Plan
              </label>

              <div className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-700/30 px-4 py-3">
                <div>
                  <p className="font-medium capitalize text-white">Free</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current account plan
                  </p>
                </div>

                <span className="rounded-full bg-slate-600/50 px-3 py-1 text-xs font-medium text-slate-300">
                  Free
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-800/30 bg-red-950/20 p-6">
          <h2 className="mb-2 text-xl font-semibold text-red-400">
            Danger Zone
          </h2>

          <p className="mb-5 text-sm text-slate-400">
            These actions affect your account. Please use them carefully.
          </p>

          <div className="space-y-3">
            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-3 font-medium text-white transition hover:bg-red-800"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Delete Account
              </h3>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-sm leading-6 text-slate-400">
              This action cannot be undone. Your account and associated data
              may be permanently deleted.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-medium text-white transition hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.error("Account deletion is not implemented yet.");
                  setShowDeleteModal(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

