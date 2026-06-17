'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { startStripeOnboarding } from '@/lib/braider/connect';

// Shown on every dashboard page until the braider's Stripe account can take
// charges. Until then, clients cannot book (enforced server-side too).
// `onboardingComplete` = the braider finished Stripe's form but charges aren't
// live yet (under review) → distinct copy from "not started".
export function ConnectBanner({ onboardingComplete }: { onboardingComplete: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function begin() {
    setError(null);
    startTransition(async () => {
      const result = await startStripeOnboarding();
      if ('error' in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="motion-safe:animate-fade-in mb-8 rounded-card border border-clay/30 bg-clay/5 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">
            {onboardingComplete
              ? 'Stripe is verifying your account'
              : 'Connect Stripe to start taking bookings'}
          </p>
          <p className="mt-1 text-sm text-ink-muted" role={error ? undefined : 'status'}>
            {onboardingComplete
              ? 'Your details are under review. Deposits stay paused until Stripe approves your account — this usually takes just a few minutes.'
              : 'Clients can’t book until you connect a Stripe account to receive deposits. It takes about two minutes, and you keep 100% of every deposit.'}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-3">
            <Button size="sm" onClick={begin} disabled={pending}>
              {pending ? (
                <>
                  <Spinner className="mr-2" />
                  Opening Stripe…
                </>
              ) : (
                <>
                  {onboardingComplete ? 'Continue setup' : 'Connect Stripe'}
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
