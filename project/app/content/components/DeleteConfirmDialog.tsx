import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, onClose, onConfirm, loading }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="w-80">
      <DialogHeader>
        <DialogTitle className="text-red-600">Delete Post?</DialogTitle>
      </DialogHeader>
      <p className="mb-4 text-gray-700">Are you sure you want to delete this post? This action cannot be undone.</p>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteConfirmDialog; 