
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkFormData } from '@/types';
import { useBookmarkStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { X, Plus, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { fetchUrlMetadata } from '@/lib/metadata';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookmarkFormProps {
  bookmarkToEdit?: Bookmark;
  isOpen: boolean;
  onClose: () => void;
}

const BookmarkForm = ({ bookmarkToEdit, isOpen, onClose }: BookmarkFormProps) => {
  const { addBookmark, updateBookmark, categories, tags } = useBookmarkStore();
  const isEditMode = !!bookmarkToEdit;
  
  const [formData, setFormData] = useState<BookmarkFormData>({
    url: '',
    title: '',
    description: '',
    tags: [],
    category: '',
    isRead: false,
    image: null,
  });
  
  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  useEffect(() => {
    if (bookmarkToEdit) {
      setFormData({
        url: bookmarkToEdit.url,
        title: bookmarkToEdit.title,
        description: bookmarkToEdit.description,
        tags: [...bookmarkToEdit.tags],
        category: bookmarkToEdit.category || '',
        isRead: bookmarkToEdit.isRead,
        image: bookmarkToEdit.image || null,
      });
      setTitleOptions([]);
    } else {
      setFormData({
        url: '',
        title: '',
        description: '',
        tags: [],
        category: '',
        isRead: false,
        image: null,
      });
      setTitleOptions([]);
    }
  }, [bookmarkToEdit, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Auto-fetch metadata when URL is inputted
    if (name === 'url' && value.trim() !== '') {
      const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      if (urlRegex.test(value.trim())) {
        fetchMetadata(value.trim());
      }
    }
  };
  
  const fetchMetadata = async (url: string) => {
    setIsLoadingMetadata(true);
    
    try {
      const metadata = await fetchUrlMetadata(url);
      
      // Set title options for dropdown
      if (metadata.titleOptions && metadata.titleOptions.length > 0) {
        setTitleOptions(metadata.titleOptions);
      }
      
      // Only set values if we have metadata and the fields are empty
      setFormData(prev => ({
        ...prev,
        title: prev.title || metadata.title || '',
        description: prev.description || metadata.description || '',
        image: prev.image || metadata.image
      }));
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsLoadingMetadata(false);
    }
  };
  
  const handleTitleSelect = (selectedTitle: string) => {
    setFormData(prev => ({ ...prev, title: selectedTitle }));
  };
  
  const handleToggleChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, isRead: value }));
  };
  
  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
    
    setNewTag('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      // Improved URL validation regex that accepts YouTube URLs with parameters
      const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      if (!urlRegex.test(formData.url.trim())) {
        newErrors.url = 'Please enter a valid URL';
      }
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      let url = formData.url;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const processedFormData = {
        ...formData,
        url
      };
      
      if (isEditMode && bookmarkToEdit) {
        updateBookmark(bookmarkToEdit.id, processedFormData);
        toast.success('Bookmark updated successfully');
      } else {
        addBookmark(processedFormData);
        toast.success('Bookmark added successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Failed to save bookmark');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] animate-slide-in overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Bookmark' : 'Add New Bookmark'}
          </DialogTitle>
          <DialogDescription>
            Save your favorite URLs with metadata and organize them with tags.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={handleInputChange}
                  className={`glass-input pr-10 ${errors.url ? 'border-destructive' : ''}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isLoadingMetadata ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
            </div>
            
            {formData.image && (
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="relative w-full h-32 rounded-md overflow-hidden bg-secondary/20">
                  <img 
                    src={formData.image} 
                    alt="URL thumbnail" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image on error
                      (e.target as HTMLImageElement).style.display = 'none';
                      setFormData(prev => ({ ...prev, image: null }));
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Bookmark title"
                value={formData.title}
                onChange={handleInputChange}
                className={`glass-input ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              
              {titleOptions.length > 1 && (
                <div className="mt-2">
                  <Label htmlFor="titleSelect">Suggested Titles</Label>
                  <Select onValueChange={handleTitleSelect}>
                    <SelectTrigger className="w-full glass-input mt-1">
                      <SelectValue placeholder="Select a title" />
                    </SelectTrigger>
                    <SelectContent>
                      {titleOptions.map((title, index) => (
                        <SelectItem key={index} value={title}>
                          <div className="flex items-center">
                            <span className="truncate mr-2">{title}</span>
                            {title === formData.title && <Check className="h-3 w-3" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add a description..."
                value={formData.description}
                onChange={handleInputChange}
                className="glass-input min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <div className="relative">
                <Input
                  list="categorySuggestions"
                  id="category"
                  name="category"
                  placeholder="Select or create a category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="glass-input"
                />
                <datalist id="categorySuggestions">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="newTag"
                  name="newTag"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="glass-input flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  size="icon"
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <div 
                    key={tag}
                    className="inline-flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {tags.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {tags
                      .filter(tag => !formData.tags.includes(tag))
                      .slice(0, 5)
                      .map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }))
                          }}
                          className="inline-flex items-center bg-secondary/50 hover:bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isRead"
                checked={formData.isRead}
                onCheckedChange={handleToggleChange}
              />
              <Label htmlFor="isRead" className="cursor-pointer">Mark as read</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Save Changes' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkForm;
