import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only instantiate Redis if we have real credentials
const hasUpstashConfig = process.env.UPSTASH_REDIS_REST_URL && 
                        !process.env.UPSTASH_REDIS_REST_URL.includes('mock');

const redis = hasUpstashConfig ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
}) : null;

// Limits: 
// 5 scans per day for free tier/anonymous
const extractRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 d'),
  analytics: true,
}) : null;

// 10 reports per hour
const reportRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
}) : null;

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Rate limit /api/extract
  if (path === '/api/extract' && extractRateLimit) {
    const { success, limit, reset, remaining } = await extractRateLimit.limit(`extract_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Upgrade to Pro for unlimited scans.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // Rate limit /api/report
  if (path === '/api/report' && reportRateLimit) {
    const { success, limit, reset, remaining } = await reportRateLimit.limit(`report_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
