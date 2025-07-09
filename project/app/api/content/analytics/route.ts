import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const userPayload = getUserFromToken(token);
    if (!userPayload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const userId = userPayload.userId;
    const posts = await Post.find({ seller: userId });
    const user = await User.findById(userId);
    
    // Calculate stats
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const engagementRate = posts.length ? (((totalLikes + totalComments) / posts.length) * 100).toFixed(2) : '0.00';
    const followerGrowth = user?.followers?.length || 0;
    const contentScore = posts.length ? Math.round((totalLikes + totalComments + totalViews) / posts.length) : 0;
    
    // Best performing content
    const bestContent = posts
      .map(p => ({
        id: p._id.toString(),
        title: p.title,
        mediaUrl: p.media?.[0] || '',
        views: p.views || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
      }))
      .sort((a, b) => (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments))
      .slice(0, 5);
    
    // Audience demographics (mocked for now)
    const demographics = {
      age: [
        { label: '18-24', value: 30 },
        { label: '25-34', value: 40 },
        { label: '35-44', value: 20 },
        { label: '45-54', value: 7 },
        { label: '55+', value: 3 },
      ],
      gender: [
        { label: 'Female', value: 55 },
        { label: 'Male', value: 40 },
        { label: 'Other', value: 5 },
      ],
      locations: [
        { label: 'Mumbai', value: 2600 },
        { label: 'Delhi', value: 2000 },
        { label: 'Bangalore', value: 1700 },
        { label: 'Chennai', value: 1400 },
        { label: 'Kolkata', value: 1200 },
      ],
    };
    // Mock trend data (weekly views, likes, comments)
    const trend = [
      { date: 'Week 1', views: 1200, likes: 80, comments: 12 },
      { date: 'Week 2', views: 1800, likes: 120, comments: 18 },
      { date: 'Week 3', views: 2400, likes: 160, comments: 24 },
      { date: 'Week 4', views: 2100, likes: 140, comments: 21 },
      { date: 'Week 5', views: 2800, likes: 200, comments: 28 },
      { date: 'Week 6', views: 3200, likes: 230, comments: 32 },
      { date: 'Week 7', views: 2900, likes: 210, comments: 29 },
    ];
    
    return NextResponse.json({
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      followerGrowth,
      contentScore,
      bestContent,
      demographics,
      trend,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 