'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentHeader from './components/ContentHeader';
import AnalyticsOverview from './components/AnalyticsOverview';
import PerformanceChart from './components/PerformanceChart';
import BestContentList from './components/BestContentList';
import Demographics from './components/Demographics';
import ContentFilters from './components/ContentFilters';
import ContentGrid from './components/ContentGrid';
import CreateEditModal from './components/CreateEditModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

interface Post {
  _id: string;
  title: string;
  description: string;
  media: string[];
  mediaType: 'image' | 'video' | 'text';
  taggedProduct?: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  views: number;
  likes: number;
  comments: number;
  likedBy: string[];
  createdAt: string;
  isActive: boolean;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  bestContent?: Array<{
    id: string;
  title: string;
    mediaUrl: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  demographics?: {
    age?: Array<{ label: string; value: number }>;
    gender?: Array<{ label: string; value: number }>;
    locations?: Array<{ label: string; value: number }>;
  };
  trend?: Array<{ date: string; views: number }>;
  engagementRate?: number;
  followerGrowth?: number;
  contentScore?: number;
}

export default function ContentPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/content', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!res.ok) {
          let errorMsg = 'Failed to fetch posts';
          try {
            const errData = await res.json();
            errorMsg = errData.message || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }

        const text = await res.text();
        console.log('API response:', text);
        
        let data: any = { posts: [] };
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error('Invalid JSON from API');
          }
        }

        setPosts(data.posts || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/content/analytics', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchAnalytics();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || post.mediaType === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle create post
  const handleCreatePost = async (formData: any) => {
    setModalLoading(true);
    setModalError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await res.json();
      setPosts(prev => [newPost.post, ...prev]);
      setShowCreateModal(false);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle edit post
  const handleEditPost = async (formData: any) => {
    if (!editingPost) return;
    
    setModalLoading(true);
    setModalError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/content/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      const updatedPost = await res.json();
      setPosts(prev => prev.map(post => 
        post._id === editingPost._id ? updatedPost.post : post
      ));
      setEditingPost(null);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!deletingPost) return;
    
    setModalLoading(true);
    setModalError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/content/${deletingPost._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      setPosts(prev => prev.filter(post => post._id !== deletingPost._id));
      setDeletingPost(null);
      setShowDeleteModal(false);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle share post
  const handleSharePost = (post: Post) => {
    // Implement share functionality
    console.log('Sharing post:', post.title);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDateRange('30days');
    setSelectedPerformance('all');
  };

  // Build analytics cards from backend analytics
  const analyticsCards = analytics ? [
    {
      title: '30-Day Post Views',
      value: analytics.totalViews?.toLocaleString() ?? '0',
      change: '',
      changeType: 'positive' as const,
      icon: 'Eye',
      color: 'primary',
    },
    {
      title: 'Total Likes',
      value: analytics.totalLikes?.toLocaleString() ?? '0',
      change: '',
      changeType: 'positive' as const,
      icon: 'Heart',
      color: 'secondary',
    },
    {
      title: 'Total Comments',
      value: analytics.totalComments?.toLocaleString() ?? '0',
      change: '',
      changeType: 'positive' as const,
      icon: 'Users',
      color: 'success',
    },
    {
      title: 'Engagement Rate',
      value: analytics.engagementRate ? `${analytics.engagementRate}%` : '0.00%',
      change: '',
      changeType: 'positive' as const,
      icon: 'Heart',
      color: 'secondary',
    },
    {
      title: 'Follower Growth',
      value: analytics.followerGrowth?.toLocaleString() ?? '0',
      change: '',
      changeType: 'positive' as const,
      icon: 'Users',
      color: 'success',
    },
    {
      title: 'Content Score',
      value: analytics.contentScore?.toLocaleString() ?? '0',
      change: '',
      changeType: 'positive' as const,
      icon: 'TrendingUp',
      color: 'warning',
    },
  ] : [];

  // Use analytics.trend for performance chart, or show placeholder if missing
  const performanceData = analytics?.trend || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <ContentHeader onAdd={() => setShowCreateModal(true)} />
        <AnalyticsOverview analyticsData={analyticsCards} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PerformanceChart performanceData={performanceData} />
          </div>
          <div>
            <BestContentList bestContent={analytics?.bestContent} />
          </div>
        </div>
        <Demographics demographics={analytics?.demographics} />
        <ContentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          selectedPerformance={selectedPerformance}
          onPerformanceChange={setSelectedPerformance}
          onClear={clearFilters}
        />
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}
        <ContentGrid
          posts={filteredPosts}
          onEdit={(post) => setEditingPost(post)}
          onDelete={(post) => {
            setDeletingPost(post);
            setShowDeleteModal(true);
          }}
          onShare={handleSharePost}
        />
        <CreateEditModal
          open={showCreateModal || !!editingPost}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPost(null);
            setModalError('');
          }}
          onSave={editingPost ? handleEditPost : handleCreatePost}
          initialData={editingPost}
          loading={modalLoading}
          error={modalError}
        />
        <DeleteConfirmDialog
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingPost(null);
          }}
          onConfirm={handleDeletePost}
          loading={modalLoading}
        />
      </div>
    </DashboardLayout>
  );
}