export interface DesignComment {
  id: string;
  authorId: string;
  authorEmail: string;
  text: string;
  parentId: string | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}
