import { NextResponse } from 'next/server';
import { redis } from '@/lib/data';
import fs from 'fs';
import path from 'path';

const VISITOR_FILE = path.join(process.cwd(), 'visitors.json');

export async function GET() {
  let count = 0;

  if (redis) {
    try {
      count = await redis.incr('tss_visitor_count');
      return NextResponse.json({ count });
    } catch (e) {
      console.error("Redis visitor increment error", e);
    }
  }

  // Fallback to local file if Redis is not configured (for local dev)
  try {
    if (fs.existsSync(VISITOR_FILE)) {
      count = parseInt(fs.readFileSync(VISITOR_FILE, 'utf-8')) || 0;
    }
    count += 1;
    fs.writeFileSync(VISITOR_FILE, count.toString());
  } catch (e) {
    console.error("Local visitor increment error", e);
    count = 1; // Fallback
  }

  return NextResponse.json({ count });
}
