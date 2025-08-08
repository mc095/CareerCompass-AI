import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';

export async function GET(request: Request) {
  const userId = await getCurrentUser();
  
  if (!userId) {
    return NextResponse.json({ isAuthenticated: false });
  }

  return NextResponse.json({ isAuthenticated: true, userId });
}
