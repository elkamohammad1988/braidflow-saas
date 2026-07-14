'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatMoney } from '@/lib/utils';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';

// Null when no publishable key is set — in that case the pay page renders the
// demo checkout instead of this component, so Stripe.js is never needed.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Stripe Elements render in a cross-origin iframe, so they can't read the app's
// CSS variables — the appearance must be handed over as literal values mirroring
// the design tokens. We ship one per theme so the fields feel native at this
// critical conversion moment, both driven by the signature violet primary:
//   • DARK  → violet primary on purple-noir (#140C26 fields, purple glow)
//   • LIGHT → violet primary on lavender-white
const darkAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#8B5CF6',
    colorText: '#FFFFFF',
    colorTextSecondary: '#B7B0C8',
    colorBackground: '#140C26',
    colorDanger: '#F87171',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '12px',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(139,92,246,0.28)',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
      padding: '11px 14px'
    },
    '.Input:focus': {
      border: '1px solid rgba(139,92,246,0.7)',
      boxShadow: '0 0 0 4px rgba(139,92,246,0.22)'
    },
    '.Label': { fontWeight: '500', fontSize: '13px', color: '#B7B0C8', marginBottom: '6px' },
    '.Tab': { border: '1px solid rgba(139,92,246,0.28)', boxShadow: 'none' },
    '.Tab:hover': { borderColor: 'rgba(139,92,246,0.55)' },
    '.Tab--selected': { borderColor: '#8B5CF6', boxShadow: '0 0 0 1px #8B5CF6' }
  }
};

const lightAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#7C3AED',
    colorText: '#18181B',
    colorTextSecondary: '#6E6880',
    colorBackground: '#FFFFFF',
    colorDanger: '#DC2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '12px',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(139,92,246,0.2)',
      boxShadow: '0 1px 2px rgba(76,65,104,0.06)',
      padding: '11px 14px'
    },
    '.Input:focus': {
      border: '1px solid rgba(139,92,246,0.6)',
      boxShadow: '0 0 0 4px rgba(139,92,246,0.16)'
    },
    '.Label': { fontWeight: '500', fontSize: '13px', color: '#6E6880', marginBottom: '6px' },
    '.Tab': { border: '1px solid rgba(139,92,246,0.2)', boxShadow: 'none' },
    '.Tab:hover': { borderColor: 'rgba(139,92,246,0.5)' },
    '.Tab--selected': { borderColor: '#7C3AED', boxShadow: '0 0 0 1px #7C3AED' }
  }
};

type Props = {
  clientSecret: string;
  bookingId: string;
  depositCents: number;
  // Query string (e.g. `?t=<token>`) appended to the post-payment return URL so a
  // guest stays authorized on the confirmation page. Empty for signed-in clients.
  returnQuery?: string;
};

export function Checkout({ clientSecret, bookingId, depositCents, returnQuery = '' }: Props) {
  // Read the live theme so the iframe matches the page. Defaults to dark (the
  // signature) for the first paint, then corrects after mount; Stripe applies the
  // updated appearance in place without re-creating the (fixed) clientSecret.
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);
  const options = useMemo(
    () => ({ clientSecret, appearance: isDark ? darkAppearance : lightAppearance }),
    [clientSecret, isDark]
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm bookingId={bookingId} depositCents={depositCents} returnQuery={returnQuery} />
    </Elements>
  );
}

function CheckoutForm({
  bookingId,
  depositCents,
  returnQuery
}: {
  bookingId: string;
  depositCents: number;
  returnQuery: string;
}) {
  const t = useTranslations('pay');
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}/confirmation${returnQuery}`
      }
    });

    // Reachable only for inline validation errors. On success Stripe redirects
    // before this resolves; on async failures the user is redirected with
    // ?redirect_status=failed and the confirmation page handles it.
    if (stripeError) {
      setError(stripeError.message ?? t('cardError'));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-busy={submitting}>
      {/* Announce the multi-second charge round-trip to screen readers (the button
          label change alone lives in no live region, and the disabling drops focus). */}
      <span role="status" className="sr-only">
        {submitting ? t('charging') : ''}
      </span>
      <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
        {!ready && (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Spinner />
            <span className="ms-2 text-sm">{t('loadingCheckout')}</span>
          </div>
        )}
        <div className={ready ? 'block' : 'hidden'}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{ layout: 'tabs' }}
          />
        </div>
      </div>

      {error && (
        <Alert tone="danger" className="mt-4">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || !ready || submitting}
        className="mt-5 w-full"
      >
        {submitting ? (
          <>
            <Spinner className="me-2" />
            {t('charging')}
          </>
        ) : (
          t('payDeposit', { amount: formatMoney(depositCents, locale) })
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-ink-muted">
        {t('cancellationTerms', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
      </p>
    </form>
  );
}
