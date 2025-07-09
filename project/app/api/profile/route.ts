import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
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
    const updateData = await request.json();
    const user = await User.findByIdAndUpdate(userPayload.userId, updateData, { new: true });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 