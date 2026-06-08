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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1a1410',
    colorText: '#1a1410',
    colorBackground: '#ffffff',
    colorDanger: '#dc2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '10px',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(26,20,16,0.1)',
      boxShadow: 'none',
      padding: '10px 12px'
    },
    '.Input:focus': {
      border: '1px solid rgba(26,20,16,0.3)',
      boxShadow: '0 0 0 3px rgba(26,20,16,0.08)'
    },
    '.Label': {
      fontWeight: '500',
      fontSize: '13px',
      marginBottom: '6px'
    }
  }
};

type Props = {
  clientSecret: string;
  bookingId: string;
  depositCents: number;
};

export function Checkout({ clientSecret, bookingId, depositCents }: Props) {
  const options = useMemo(() => ({ clientSecret, appearance }), [clientSecret]);

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm bookingId={bookingId} depositCents={depositCents} />
    </Elements>
  );
}

function CheckoutForm({ bookingId, depositCents }: { bookingId: string; depositCents: number }) {
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
        return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`
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
      <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
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
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
        By paying, you agree to the braider's cancellation policy.
      </p>
    </form>
  );
}
