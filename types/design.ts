export interface DesignPage {
  id: string;
  name: string;
  json: string; // Fabric.js canvas JSON
}

export interface DesignDocument {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnail: string;
  pages: DesignPage[];
  activePageId: string;
  width: number;
  height: number;
  templateId: string | null;
  isPublic: boolean;
  workspaceId?: string | null;
  sharing?: {
    visibility: "private" | "link" | "specific";
    members: { email: string; role: "editor" | "viewer" }[];
  };
  downloads: number;
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsed: number;
  subscriptionPlan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}