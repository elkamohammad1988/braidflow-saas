'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type ActionResult = { ok: true } | { error: string };

/**
 * Shared plumbing for the booking confirm-buttons (cancel / refund / finalize).
 * Each renders its own two-phase JSX — a trigger row, then a confirm row — but
 * the mechanics are identical and drift when copy-pasted (a refund variant once
 * lost its generic-error fallback), so they live here once:
 *   - a `confirming` variant (null = idle),
 *   - a pending transition + an announced error,
 *   - focus that follows the interaction into the confirm control and back to
 *     the trigger (otherwise keyboard focus silently drops to <body>),
 *   - a run() that submits, keeps the error visible on failure, and refreshes.
 *
 * `V` is the confirm variant: `true` for a single-action button, or a small
 * union (e.g. 'completed' | 'no_show') when one trigger opens different
 * confirmations.
 */
export function useConfirmAction<V>(runAction: (variant: V) => Promise<ActionResult>) {
  const t = useTranslations('bookingActions');
  const router = useRouter();
  const [confirming, setConfirming] = useState<V | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    const isConfirming = confirming !== null;
    if (isConfirming && !wasConfirming.current) confirmRef.current?.focus();
    else if (!isConfirming && wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = isConfirming;
  }, [confirming]);

  function run(variant: V) {
    setError(null);
    startTransition(async () => {
      const result = await runAction(variant);
      if (result && 'error' in result) {
        // Stay in confirm mode so the announced error stays visible to retry.
        setError(result.error ?? t('genericError'));
        return;
      }
      router.refresh();
    });
  }

  return { confirming, setConfirming, pending, error, run, triggerRef, confirmRef };
}
