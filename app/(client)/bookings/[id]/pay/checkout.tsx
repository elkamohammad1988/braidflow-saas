'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
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

// Tuned to the atelier palette so Stripe's fields feel like part of the page,
// not a cold iframe dropped into warm paper. Two registers — light-paper and
// warm-midnight — so the card form matches the page instead of glowing white on
// the dark stage (the single most important conversion moment).
const lightAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#c78a3a',
    colorText: '#231810',
    colorTextSecondary: '#6d5c4e',
    colorBackground: '#fdfaf4',
    colorDanger: '#dc2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '12px',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(35,24,16,0.15)',
      boxShadow: 'inset 0 1px 2px rgba(35,24,16,0.04)',
      padding: '11px 14px'
    },
    '.Input:focus': {
      border: '1px solid rgba(199,138,58,0.55)',
      boxShadow: '0 0 0 4px rgba(224,163,63,0.15)'
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '13px',
      color: '#6d5c4e',
      marginBottom: '6px'
    },
    '.Tab': {
      border: '1px solid rgba(35,24,16,0.15)',
      boxShadow: 'none'
    },
    '.Tab:hover': {
      borderColor: 'rgba(199,138,58,0.5)'
    },
    '.Tab--selected': {
      borderColor: '#c78a3a',
      boxShadow: '0 0 0 1px #c78a3a'
    }
  }
};

const darkAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#e0a33f',
    colorText: '#f0e9de',
    colorTextSecondary: '#b4a898',
    colorBackground: '#211912',
    colorDanger: '#f87171',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '12px',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(245,238,227,0.17)',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
      padding: '11px 14px'
    },
    '.Input:focus': {
      border: '1px solid rgba(224,163,63,0.6)',
      boxShadow: '0 0 0 4px rgba(224,163,63,0.18)'
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '13px',
      color: '#b4a898',
      marginBottom: '6px'
    },
    '.Tab': {
      border: '1px solid rgba(245,238,227,0.17)',
      boxShadow: 'none'
    },
    '.Tab:hover': {
      borderColor: 'rgba(224,163,63,0.5)'
    },
    '.Tab--selected': {
      borderColor: '#e0a33f',
      boxShadow: '0 0 0 1px #e0a33f'
    }
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
  // `resolvedTheme` collapses "system" to light|dark; undefined until mounted, so
  // default to light. react-stripe-js applies the new appearance via
  // elements.update() when this memo changes, so the fields recolour in place.
  const { resolvedTheme } = useTheme();
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: resolvedTheme === 'dark' ? darkAppearance : lightAppearance
    }),
    [clientSecret, resolvedTheme]
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
    <form onSubmit={onSubmit}>
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
          t('payDeposit', { amount: formatMoney(depositCents) })
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-ink-muted">
        {t('cancellationTerms', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
      </p>
    </form>
  );
}
