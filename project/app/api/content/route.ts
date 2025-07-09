import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('API /api/content called');
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
    const posts = await Post.find({ seller: userPayload.userId })
      .populate('taggedProduct', 'title price images')
      .sort({ createdAt: -1 });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { title, description, media, mediaType, taggedProduct } = body;
    if (!title || !description) {
      return NextResponse.json({ message: 'Title and description are required' }, { status: 400 });
    }
    const post = await Post.create({
      seller: userPayload.userId,
      title,
      description,
      media: media || [],
      mediaType: mediaType || 'image',
      taggedProduct: taggedProduct || null,
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 