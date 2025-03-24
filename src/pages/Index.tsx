
import { useState } from 'react';
import Header from '@/components/Header';
import BookmarkList from '@/components/BookmarkList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BookmarkForm from '@/components/BookmarkForm';
import { useBookmarkStore } from '@/lib/store';

const Index = () => {
  const { bookmarks } = useBookmarkStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-7xl py-8 px-4 md:px-6">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center animate-fade-in">
            <div className="glass-card p-10 w-full">
              <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to URL Trove</h1>
              <p className="text-muted-foreground mb-8">
                Your personal bookmark manager. Save and organize your favorite URLs in one place.
              </p>
              <Button onClick={() => setIsFormOpen(true)} size="lg" className="px-8">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Bookmark
              </Button>
            </div>
          </div>
        ) : (
          <BookmarkList />
        )}
      </main>
      
      <BookmarkForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default Index;
