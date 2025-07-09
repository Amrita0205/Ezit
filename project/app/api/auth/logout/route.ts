import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from localStorage
    // This endpoint can be used for additional server-side cleanup if needed
    
    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 