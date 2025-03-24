
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  dateAdded: Date;
  lastVisited?: Date;
  tags: string[];
  category?: string;
  isRead: boolean;
  image?: string | null;
}

export type BookmarkFormData = Omit<Bookmark, 'id' | 'dateAdded' | 'lastVisited'> & {
  id?: string;
};
