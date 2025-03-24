
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bookmark, BookmarkFormData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface BookmarkState {
  bookmarks: Bookmark[];
  categories: string[];
  tags: string[];
  addBookmark: (bookmark: BookmarkFormData) => void;
  updateBookmark: (id: string, bookmark: Partial<BookmarkFormData>) => void;
  deleteBookmark: (id: string) => void;
  markAsRead: (id: string) => void;
  getCategoryBookmarks: (category?: string) => Bookmark[];
  getTaggedBookmarks: (tag: string) => Bookmark[];
  searchBookmarks: (query: string) => Bookmark[];
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      categories: [],
      tags: [],
      
      addBookmark: (bookmarkData) => {
        const newBookmark: Bookmark = {
          id: bookmarkData.id || uuidv4(),
          url: bookmarkData.url,
          title: bookmarkData.title,
          description: bookmarkData.description,
          tags: bookmarkData.tags,
          category: bookmarkData.category,
          isRead: bookmarkData.isRead,
          image: bookmarkData.image || null,
          dateAdded: new Date(),
        };
        
        set((state) => {
          // Update categories
          const categories = new Set(state.categories);
          if (newBookmark.category) {
            categories.add(newBookmark.category);
          }
          
          // Update tags
          const tags = new Set(state.tags);
          newBookmark.tags.forEach(tag => tags.add(tag));
          
          return {
            bookmarks: [...state.bookmarks, newBookmark],
            categories: Array.from(categories),
            tags: Array.from(tags)
          };
        });
      },
      
      updateBookmark: (id, bookmarkData) => {
        set((state) => {
          const updatedBookmarks = state.bookmarks.map(bookmark => {
            if (bookmark.id === id) {
              const updatedBookmark = {
                ...bookmark,
                ...bookmarkData,
              };
              return updatedBookmark;
            }
            return bookmark;
          });
          
          // Rebuild categories and tags
          const categories = new Set<string>();
          const tags = new Set<string>();
          
          updatedBookmarks.forEach(bookmark => {
            if (bookmark.category) {
              categories.add(bookmark.category);
            }
            bookmark.tags.forEach(tag => tags.add(tag));
          });
          
          return {
            bookmarks: updatedBookmarks,
            categories: Array.from(categories),
            tags: Array.from(tags)
          };
        });
      },
      
      deleteBookmark: (id) => {
        set((state) => {
          const filteredBookmarks = state.bookmarks.filter(bookmark => bookmark.id !== id);
          
          // Rebuild categories and tags
          const categories = new Set<string>();
          const tags = new Set<string>();
          
          filteredBookmarks.forEach(bookmark => {
            if (bookmark.category) {
              categories.add(bookmark.category);
            }
            bookmark.tags.forEach(tag => tags.add(tag));
          });
          
          return {
            bookmarks: filteredBookmarks,
            categories: Array.from(categories),
            tags: Array.from(tags)
          };
        });
      },
      
      markAsRead: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map(bookmark => {
            if (bookmark.id === id) {
              return {
                ...bookmark,
                isRead: true,
                lastVisited: new Date()
              };
            }
            return bookmark;
          })
        }));
      },
      
      getCategoryBookmarks: (category) => {
        const bookmarks = get().bookmarks;
        if (!category) return bookmarks;
        return bookmarks.filter(bookmark => bookmark.category === category);
      },
      
      getTaggedBookmarks: (tag) => {
        return get().bookmarks.filter(bookmark => bookmark.tags.includes(tag));
      },
      
      searchBookmarks: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().bookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(lowerQuery) ||
          bookmark.description.toLowerCase().includes(lowerQuery) ||
          bookmark.url.toLowerCase().includes(lowerQuery) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          (bookmark.category && bookmark.category.toLowerCase().includes(lowerQuery))
        );
      }
    }),
    {
      name: 'bookmark-storage',
    }
  )
);
