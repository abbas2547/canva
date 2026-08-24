import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { DesignDocument, UserDocument, DesignPage } from "@/types/design";

// =====================================================
// DESIGN OPERATIONS
// =====================================================

export async function getUserDesigns(userId: string): Promise<DesignDocument[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "designs"),
      where("userId", "==", userId),
      where("deletedAt", "==", null)
      // ORDER BY REMOVED – create Firestore index if you need sorting
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DesignDocument));
  } catch (error) {
    console.error("Error fetching designs:", error);
    return [];
  }
}

export async function getDesignById(designId: string): Promise<DesignDocument | null> {
  try {
    const docSnap = await getDoc(doc(db, "designs", designId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as DesignDocument;
  } catch (error) {
    console.error("Error fetching design:", error);
    return null;
  }
}

export async function createDesign(
  userId: string,
  title: string,
  width: number = 1080,
  height: number = 1080
): Promise<DesignDocument> {
  if (!userId) throw new Error("User ID is required");
  try {
    const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const defaultPage: DesignPage = {
      id: "page-1",
      name: "Page 1",
      json: JSON.stringify({ objects: [], background: "#ffffff" }),
    };
    const now = new Date().toISOString();
    const design: DesignDocument = {
      id: designId,
      userId,
      title,
      description: "",
      thumbnail: "",
      pages: [defaultPage],
      activePageId: "page-1",
      width,
      height,
      templateId: null,
      isPublic: false,
      downloads: 0,
      views: 0,
      likes: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await setDoc(doc(db, "designs", designId), design);
    return design;
  } catch (error) {
    console.error("Error creating design:", error);
    throw error;
  }
}

export async function updateDesign(designId: string, updates: Partial<DesignDocument>): Promise<void> {
  if (!designId) throw new Error("Design ID is required");
  try {
    const docRef = doc(db, "designs", designId);
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.width !== undefined) updateData.width = updates.width;
    if (updates.height !== undefined) updateData.height = updates.height;
    if (updates.activePageId !== undefined) updateData.activePageId = updates.activePageId;
    if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.deletedAt !== undefined) updateData.deletedAt = updates.deletedAt;

    if (updates.pages !== undefined) {
      // Read only scalar fields from existing — never propagate array fields that may be corrupted
      const docSnap = await getDoc(docRef);
      const existing = docSnap.exists() ? (docSnap.data() as Record<string, unknown>) : {};
      const fullData: Record<string, unknown> = {
        userId: existing.userId ?? "",
        title: updateData.title ?? existing.title ?? "",
        description: (typeof existing.description === "string" ? existing.description : "") ?? (typeof updateData.description === "string" ? updateData.description : ""),
        thumbnail: (typeof existing.thumbnail === "string" ? existing.thumbnail : "") ?? (typeof updateData.thumbnail === "string" ? updateData.thumbnail : ""),
        pages: updates.pages,
        activePageId: (typeof existing.activePageId === "string" ? existing.activePageId : "page-1") ?? updateData.activePageId,
        width: (typeof existing.width === "number" ? existing.width : 1080) ?? updateData.width,
        height: (typeof existing.height === "number" ? existing.height : 1080) ?? updateData.height,
        templateId: (typeof existing.templateId === "string" || existing.templateId === null ? existing.templateId : null),
        isPublic: (typeof existing.isPublic === "boolean" ? existing.isPublic : false) ?? updateData.isPublic,
        downloads: (typeof existing.downloads === "number" ? existing.downloads : 0),
        views: (typeof existing.views === "number" ? existing.views : 0),
        likes: (typeof existing.likes === "number" ? existing.likes : 0),
        tags: Array.isArray(updateData.tags) ? updateData.tags : [],
        createdAt: (typeof existing.createdAt === "string" ? existing.createdAt : now),
        updatedAt: now,
        deletedAt: existing.deletedAt ?? null,
      };
      await setDoc(docRef, fullData);
    } else {
      await updateDoc(docRef, updateData);
    }
  } catch (error) {
    console.error("Error updating design:", error);
    throw error;
  }
}

export async function deleteDesign(designId: string): Promise<void> {
  if (!designId) throw new Error("Design ID is required");
  try {
    // Soft delete
    await setDoc(doc(db, "designs", designId), {
      deletedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Error deleting design:", error);
    throw error;
  }
}

export async function duplicateDesign(designId: string, userId: string): Promise<DesignDocument> {
  if (!designId || !userId) throw new Error("Missing parameters");
  try {
    const original = await getDesignById(designId);
    if (!original) throw new Error("Design not found");
    const newId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const newDesign: DesignDocument = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      downloads: 0,
      views: 0,
      likes: 0,
    };
    await setDoc(doc(db, "designs", newId), newDesign);
    return newDesign;
  } catch (error) {
    console.error("Error duplicating design:", error);
    throw error;
  }
}

// =====================================================
// FILE UPLOAD OPERATIONS
// =====================================================

export async function uploadFileToStorage(
  userId: string,
  file: File,
  folder: string = "uploads"
): Promise<string> {
  if (!userId) throw new Error("User ID is required");
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || `Upload failed (${res.status})`);
    }
    return data.url as string;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  try {
    // For simplicity, you need to store the storage path separately to delete reliably.
    console.warn("Delete by URL not fully supported. Provide storage path instead.");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

// =====================================================
// USER OPERATIONS (with auto-create)
// =====================================================

export async function getUserProfile(userId: string): Promise<UserDocument | null> {
  if (!userId) return null;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserDocument;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function createOrUpdateUserProfile(userId: string, data: Partial<UserDocument>): Promise<UserDocument> {
  if (!userId) throw new Error("User ID required");
  try {
    const userRef = doc(db, "users", userId);
    const existing = await getDoc(userRef);
    const now = new Date().toISOString();
    if (!existing.exists()) {
      const newUser: UserDocument = {
        id: userId,
        email: data.email || "",
        displayName: data.displayName || "",
        photoURL: data.photoURL || "",
        aiCreditsUsed: 0,
        aiCreditsLimit: 10,
        storageUsed: 0,
        subscriptionPlan: "free",
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newUser);
      return newUser;
    } else {
      const updates = {
        ...data,
        updatedAt: now,
      };
      await setDoc(userRef, updates);
      const updated = await getDoc(userRef);
      return { id: updated.id, ...updated.data() } as UserDocument;
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function updateUserAICredits(userId: string, creditsUsed: number): Promise<void> {
  if (!userId) return;
  try {
    const user = await getUserProfile(userId);
    if (!user) return;
    const newCredits = Math.min(user.aiCreditsUsed + creditsUsed, user.aiCreditsLimit);
    await setDoc(doc(db, "users", userId), {
      aiCreditsUsed: newCredits,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating AI credits:", error);
  }
}

export async function updateUserStorage(userId: string, storageDelta: number): Promise<void> {
  if (!userId) return;
  try {
    const user = await getUserProfile(userId);
    if (!user) return;
    const newStorage = Math.max(0, user.storageUsed + storageDelta);
    await setDoc(doc(db, "users", userId), {
      storageUsed: newStorage,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating storage:", error);
  }
}