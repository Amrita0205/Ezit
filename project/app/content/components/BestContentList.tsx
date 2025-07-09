import React from 'react';

interface BestContentItem {
  id: string;
  title: string;
  mediaUrl: string;
  views: number;
  likes: number;
  comments: number;
}

interface BestContentListProps {
  bestContent?: BestContentItem[];
}

const BestContentList: React.FC<BestContentListProps> = ({ bestContent }) => (
  <div className="bg-white rounded shadow p-4 mb-6">
    <div className="font-semibold mb-2">Best Performing Content</div>
    {bestContent && bestContent.length > 0 ? (
      <ul className="divide-y">
        {bestContent.map((item) => (
          <li key={item.id} className="flex items-center py-2">
            <img src={item.mediaUrl} alt={item.title} className="w-12 h-12 rounded object-cover mr-4" />
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-500">Views: {item.views} · Likes: {item.likes} · Comments: {item.comments}</div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-400">No best content found.</div>
    )}
  </div>
);

export default BestContentList; 