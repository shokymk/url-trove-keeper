
import { useState } from 'react';
import { Bookmark } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useBookmarkStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, ExternalLink, MoreHorizontal, Trash, Edit, Check, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BookmarkForm from './BookmarkForm';
import { toast } from 'sonner';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  const { markAsRead, deleteBookmark } = useBookmarkStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleOpenURL = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ensure the click doesn't bubble up to the card
    
    if (!bookmark.isRead) {
      markAsRead(bookmark.id);
    }
    window.open(bookmark.url, '_blank');
  };
  
  const handleDelete = () => {
    deleteBookmark(bookmark.id);
    toast.success('Bookmark deleted');
    setIsDeleteDialogOpen(false);
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(bookmark.id);
    toast.success('Marked as read');
  };

  const handleCardClick = () => {
    setIsEditDialogOpen(true);
  };
  
  return (
    <>
      <div 
        className="glass-card p-4 relative overflow-hidden group cursor-pointer" 
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="flex items-start gap-4">
          {bookmark.image && !imageError && (
            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-secondary/20">
              <img 
                src={bookmark.image} 
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg truncate hover:text-primary transition-colors duration-200">
                {bookmark.title}
              </h3>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 ml-2 flex-shrink-0 z-10 relative border-muted hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md" 
                onClick={handleOpenURL}
                title="Open URL"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 truncate">
              <span className="inline-flex items-center">
                <Link className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                {new URL(bookmark.url).hostname}
              </span>
            </p>
            
            {bookmark.description && (
              <p className="mt-2 text-sm line-clamp-2">{bookmark.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {bookmark.category && (
                <Badge variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10">
                  {bookmark.category}
                </Badge>
              )}
              
              {bookmark.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 z-10 relative" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={handleOpenURL} className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Open URL
                </DropdownMenuItem>
                {!bookmark.isRead && (
                  <DropdownMenuItem onClick={handleMarkAsRead} className="cursor-pointer">
                    <Check className="mr-2 h-4 w-4" /> Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }} className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground">
              {bookmark.isRead ? (
                <span className="inline-flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Read
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Unread
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>Added {formatDistanceToNow(new Date(bookmark.dateAdded), { addSuffix: true })}</span>
          {bookmark.lastVisited && (
            <span>Visited {formatDistanceToNow(new Date(bookmark.lastVisited), { addSuffix: true })}</span>
          )}
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bookmark "{bookmark.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BookmarkForm
        bookmarkToEdit={bookmark}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};

export default BookmarkCard;
