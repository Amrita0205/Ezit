import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

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
    const { file, type } = await request.json();
    if (!file || !type) {
      return NextResponse.json({ message: 'File and type are required' }, { status: 400 });
    }
    const url = await uploadToCloudinary(file, `ezit/documents/${type}`);
    const update = { $set: {} };
    update.$set[`documents.${type}`] = url;
    const user = await User.findByIdAndUpdate(userPayload.userId, update, { new: true });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Document uploaded', url });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 