import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
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
    const orderId = params.id;
    const updateData = await request.json();
    const order = await Order.findOneAndUpdate(
      { _id: orderId, seller: userPayload.userId },
      updateData,
      { new: true }
    );
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Order updated', order });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 