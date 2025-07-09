import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const userPayload = getUserFromToken(token);
    if (!userPayload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const products = await Product.find({ seller: userPayload.userId })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const userPayload = getUserFromToken(token);
    if (!userPayload) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const productData = await request.json();

    // Validate required fields
    if (!productData.title || !productData.price || !productData.category) {
      return NextResponse.json(
        { message: 'Title, price, and category are required' },
        { status: 400 }
      );
    }

    // Create new product
    const product = await Product.create({
      ...productData,
      seller: userPayload.userId,
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}