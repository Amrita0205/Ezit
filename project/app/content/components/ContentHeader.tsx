import React from 'react';
import { Button } from '@/components/ui/button';

interface ContentHeaderProps {
  onAdd: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ onAdd }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold">Content & Analytics</h1>
      <p className="text-gray-500">Manage your posts and view performance analytics.</p>
    </div>
    <Button onClick={onAdd} className="bg-blue-600 text-white">Add New Post</Button>
  </div>
);

export default ContentHeader; 