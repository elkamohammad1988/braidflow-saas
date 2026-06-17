import { NextResponse } from 'next/server';
import { startStripeOnboarding } from '@/lib/braider/connect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe calls this when an onboarding link expires or is revisited. Mint a fresh
// link and send the braider straight back into Stripe's flow.
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  const result = await startStripeOnboarding();
  if ('error' in result) {
    return NextResponse.redirect(new URL('/dashboard/settings?connect=error', base));
  }
  return NextResponse.redirect(result.url);
}
