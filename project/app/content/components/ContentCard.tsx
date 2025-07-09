import React from 'react';
import { Button } from '@/components/ui/button';

interface ContentCardProps {
  post: any;
  onEdit: (post: any) => void;
  onDelete: (post: any) => void;
  onShare: (post: any) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ post, onEdit, onDelete, onShare }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col">
    <img src={post.media?.[0] || post.thumbnail} alt={post.title} className="w-full h-40 object-cover rounded mb-2" />
    <div className="font-semibold text-lg mb-1">{post.title}</div>
    <div className="text-gray-500 text-sm mb-2">{post.description}</div>
    <div className="flex items-center text-xs text-gray-400 mb-2">
      <span>Views: {post.views || 0}</span>
      <span className="mx-2">·</span>
      <span>Likes: {post.likes || 0}</span>
      <span className="mx-2">·</span>
      <span>Comments: {post.comments || 0}</span>
    </div>
    <div className="flex gap-2 mt-auto">
      <Button size="sm" variant="outline" onClick={() => onEdit(post)}>Edit</Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(post)}>Delete</Button>
      <Button size="sm" variant="secondary" onClick={() => onShare(post)}>Share</Button>
    </div>
  </div>
);

export default ContentCard; 