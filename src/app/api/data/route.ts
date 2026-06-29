import { NextResponse } from 'next/server';
import { getPersistedData } from '@/lib/data';

export async function GET() {
  const data = await getPersistedData();
  return NextResponse.json({ data });
}
