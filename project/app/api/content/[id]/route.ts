import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const postId = params.id;
    const updateData = await request.json();
    const post = await Post.findOneAndUpdate(
      { _id: postId, seller: userPayload.userId },
      updateData,
      { new: true }
    ).populate('taggedProduct', 'title price images');
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post updated', post });
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const postId = params.id;
    const post = await Post.findOneAndDelete({ _id: postId, seller: userPayload.userId });
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const postId = params.id;
    const body = await request.json();
    let post;
    if (body.action === 'like') {
      post = await Post.findById(postId);
      if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
      if (!post.likedBy) post.likedBy = [];
      if (post.likedBy.includes(userPayload.userId)) {
        return NextResponse.json({ message: 'Already liked' }, { status: 400 });
      }
      post.likes = (post.likes || 0) + 1;
      post.likedBy.push(userPayload.userId);
      await post.save();
    } else if (body.action === 'comment') {
      post = await Post.findById(postId);
      if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
      post.comments = (post.comments || 0) + 1;
      await post.save();
    } else if (body.action === 'view') {
      post = await Post.findById(postId);
      if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
      post.views = (post.views || 0) + 1;
      await post.save();
    }
    return NextResponse.json({ message: 'Post updated', post });
  } catch (error) {
    console.error('Post patch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 