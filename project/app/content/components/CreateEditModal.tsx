import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  error?: string;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({ open, onClose, onSave, initialData, loading, error }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [media, setMedia] = useState(initialData?.media?.[0] || '');
  const [type, setType] = useState(initialData?.mediaType || 'image');

  useEffect(() => {
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setMedia(initialData?.media?.[0] || '');
    setType(initialData?.mediaType || 'image');
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, media: [media], mediaType: type });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Post' : 'Create Post'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input 
              className="border rounded px-3 py-2 w-full" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea 
              className="border rounded px-3 py-2 w-full" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Image URL</label>
            <input 
              className="border rounded px-3 py-2 w-full" 
              value={media} 
              onChange={e => setMedia(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select 
              className="border rounded px-3 py-2 w-full" 
              value={type} 
              onChange={e => setType(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="text">Text</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Save' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditModal; 