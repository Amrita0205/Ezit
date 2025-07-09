import React from 'react';
import ContentCard from './ContentCard';

interface ContentGridProps {
  posts: any[];
  onEdit: (post: any) => void;
  onDelete: (post: any) => void;
  onShare: (post: any) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ posts, onEdit, onDelete, onShare }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {posts && posts.length > 0 ? (
      posts.map((post) => (
        <ContentCard key={post._id || post.id} post={post} onEdit={onEdit} onDelete={onDelete} onShare={onShare} />
      ))
    ) : (
      <div className="col-span-full text-gray-400 text-center py-8">No content found.</div>
    )}
  </div>
);

export default ContentGrid; 