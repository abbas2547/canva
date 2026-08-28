export type ShareRole = "editor" | "viewer";
export type ShareVisibility = "private" | "link" | "specific";

export interface ShareMember {
  email: string;
  role: ShareRole;
}

export interface DesignSharing {
  visibility: ShareVisibility;
  members: ShareMember[];
}
