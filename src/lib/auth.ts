'use server';

import { cookies } from 'next/headers';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  resumeText: string;
  profilePicUrl: string;
  scores: {
    Communication: number;
    Technical: number;
    "Problem Solving": number;
    Leadership: number;
    "Project Mgmt": number;
    Teamwork: number;
  };
}

// Simple password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Set session cookie
export async function setUserSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('user-session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Get current user session
export async function getCurrentUser() {
  const cookieStore = await cookies();
  return cookieStore.get('user-session')?.value;
}

// Remove session cookie
export async function removeUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user-session');
}
