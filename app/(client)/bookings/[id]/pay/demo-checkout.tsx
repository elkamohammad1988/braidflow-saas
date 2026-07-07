'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CreditCard, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney } from '@/lib/utils';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { confirmDemoDepositAction } from '@/lib/bookings/confirm-demo';

// Simulated deposit checkout for the keyless demo. Mirrors the look of the real
// Stripe form, but no card is charged — pressing pay calls a server action that
// confirms the booking, then routes to the confirmation screen.
export function DemoCheckout({
  bookingId,
  depositCents,
  token,
  snapshot
}: {
  bookingId: string;
  depositCents: number;
  token?: string;
  snapshot?: string;
}) {
  const t = useTranslations('pay');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onPay() {
    setError(null);
    startTransition(async () => {
      const res = await confirmDemoDepositAction({ bookingId, token, snapshot });
      if ('error' in res) {
        setError(t('cardError'));
        return;
      }
      // Carry the confirmed snapshot (+ guest token) so the confirmation page
      // renders success even if it lands on a different serverless instance.
      const params = new URLSearchParams();
      if (token) params.set('t', token);
      params.set('d', res.snapshot);
      router.push(`/bookings/${bookingId}/confirmation?${params.toString()}`);
    });
  }

  return (
    <div>
      <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
        {/* Test-mode banner */}
        <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/[0.08] px-3.5 py-2.5 text-sm text-clay-text">
          <Sparkles className="h-4 w-4 shrink-0 text-clay" strokeWidth={2} />
          <span>
            <span className="font-semibold">{t('testMode')}</span> — {t('demoNote')}
          </span>
        </div>

        {/* A realistic (but inert) test card, so the flow reads like a real one. */}
        <p className="mt-5 mb-1.5 text-[13px] font-medium text-ink-muted">{t('demoCard')}</p>
        <div className="flex items-center gap-3 rounded-xl border border-line-strong bg-cream/50 px-4 py-3.5">
          <CreditCard className="h-5 w-5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
          <span className="font-mono text-sm tracking-[0.12em] text-ink">4242 4242 4242 4242</span>
          <span className="ms-auto font-mono text-sm text-ink-muted">12 / 34</span>
          <span className="font-mono text-sm text-ink-muted">123</span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <Button type="button" size="lg" onClick={onPay} disabled={pending} className="mt-5 w-full">
        {pending ? (
          <>
            <Spinner className="me-2" />
            {t('charging')}
          </>
        ) : (
          t('payDeposit', { amount: formatMoney(depositCents) })
        )}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
        <Lock className="h-3 w-3 shrink-0 text-ink-subtle" strokeWidth={2} />
        {t('cancellationTerms', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
      </p>
    </div>
  );
}
