'use client';

import { useMemo, useState } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney } from '@/lib/utils';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Tuned to the atelier palette so Stripe's fields feel like part of the page,
// not a cold white iframe dropped into warm paper.
const appearance: Appearance = {
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

type Props = {
  clientSecret: string;
  bookingId: string;
  depositCents: number;
  // Query string (e.g. `?t=<token>`) appended to the post-payment return URL so a
  // guest stays authorized on the confirmation page. Empty for signed-in clients.
  returnQuery?: string;
};

export function Checkout({ clientSecret, bookingId, depositCents, returnQuery = '' }: Props) {
  const options = useMemo(() => ({ clientSecret, appearance }), [clientSecret]);

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
      setError(stripeError.message ?? 'Something went wrong with your card.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
        {!ready && (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Spinner />
            <span className="ml-2 text-sm">Loading secure checkout…</span>
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
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || !ready || submitting}
        className="mt-5 w-full"
      >
        {submitting ? (
          <>
            <Spinner className="mr-2" />
            Charging your deposit…
          </>
        ) : (
          `Pay ${formatMoney(depositCents)} deposit`
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-ink-muted">
        By paying, you agree to the cancellation policy: a full deposit refund if you cancel
        at least {CANCELLATION_REFUND_WINDOW_HOURS} hours before your appointment; the deposit
        is non-refundable after that.
      </p>
    </form>
  );
}
