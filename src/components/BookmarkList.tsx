
import { useState, useEffect } from 'react';
import { Bookmark } from '@/types';
import BookmarkCard from './BookmarkCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, Plus, Filter, BookOpen, BookX, X } from 'lucide-react';
import BookmarkForm from './BookmarkForm';
import { useBookmarkStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

const BookmarkList = () => {
  const { bookmarks, categories, tags, getCategoryBookmarks, getTaggedBookmarks, searchBookmarks } = useBookmarkStore();
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    let results = bookmarks;
    
    // Apply category filter
    if (selectedCategory) {
      results = getCategoryBookmarks(selectedCategory);
    }
    
    // Apply tag filter
    if (selectedTag) {
      results = results.filter(bookmark => bookmark.tags.includes(selectedTag));
    }
    
    // Apply read/unread filter
    if (readFilter === 'read') {
      results = results.filter(bookmark => bookmark.isRead);
    } else if (readFilter === 'unread') {
      results = results.filter(bookmark => !bookmark.isRead);
    }
    
    // Apply search query
    if (searchQuery) {
      results = searchBookmarks(searchQuery).filter(bookmark => 
        results.some(b => b.id === bookmark.id)
      );
    }
    
    // Sort by date (newest first)
    results = [...results].sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
    
    setFilteredBookmarks(results);
  }, [bookmarks, searchQuery, selectedCategory, selectedTag, readFilter]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setReadFilter('all');
  };
  
  const hasActiveFilters = searchQuery || selectedCategory || selectedTag || readFilter !== 'all';
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 glass-input"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Bookmark
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center">
          <Filter className="mr-1.5 h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select
          value={selectedCategory || ''}
          onValueChange={(value) => setSelectedCategory(value || undefined)}
        >
          <SelectTrigger className="h-9 w-[160px] glass-input">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedTag || ''}
          onValueChange={(value) => setSelectedTag(value || undefined)}
        >
          <SelectTrigger className="h-9 w-[160px] glass-input">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All tags</SelectItem>
            {tags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={readFilter}
          onValueChange={(value) => setReadFilter(value as 'all' | 'read' | 'unread')}
        >
          <SelectTrigger className="h-9 w-[130px] glass-input">
            <SelectValue placeholder="Read status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            <SelectItem value="read">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Read
              </div>
            </SelectItem>
            <SelectItem value="unread">
              <div className="flex items-center">
                <BookX className="mr-2 h-4 w-4" />
                Unread
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">
                Category: {selectedCategory}
                <button 
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {selectedTag && (
              <Badge variant="secondary">
                Tag: {selectedTag}
                <button 
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedTag(undefined)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {readFilter !== 'all' && (
              <Badge variant="outline" className="bg-secondary/70">
                {readFilter === 'read' ? 'Read only' : 'Unread only'}
                <button 
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setReadFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {searchQuery && (
              <Badge variant="outline">
                Search: "{searchQuery}"
                <button 
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-6">
          {filteredBookmarks.length > 0 
            ? `${filteredBookmarks.length} bookmark${filteredBookmarks.length !== 1 ? 's' : ''}`
            : 'No bookmarks found'}
        </h2>
        
        {filteredBookmarks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-lg bg-secondary/20">
            <div className="max-w-sm space-y-3">
              <h3 className="text-lg font-medium">No bookmarks found</h3>
              <p className="text-muted-foreground">
                {bookmarks.length === 0 
                  ? 'Add your first bookmark to get started.'
                  : 'Try adjusting your filters or search query to find what you\'re looking for.'}
              </p>
              <Button 
                onClick={() => {
                  if (bookmarks.length === 0) {
                    setIsFormOpen(true);
                  } else {
                    clearFilters();
                  }
                }}
              >
                {bookmarks.length === 0 ? 'Add a bookmark' : 'Clear all filters'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookmarks.map(bookmark => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        )}
      </div>
      
      <BookmarkForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default BookmarkList;
