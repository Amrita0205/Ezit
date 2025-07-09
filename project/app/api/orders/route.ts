import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

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
    const orders = await Order.find({ seller: userPayload.userId })
      .sort({ createdAt: -1 })
      .populate('product');
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
} 