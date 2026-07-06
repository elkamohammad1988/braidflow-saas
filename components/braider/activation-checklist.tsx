'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Check, Clock, CreditCard, Plus, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { startStripeOnboarding } from '@/lib/braider/connect';
import { cn } from '@/lib/utils';

type Props = {
  hasService: boolean;
  hasHours: boolean;
  chargesEnabled: boolean;
  onboardingComplete: boolean;
};

export function ActivationChecklist({
  hasService,
  hasHours,
  chargesEnabled,
  onboardingComplete
}: Props) {
  const t = useTranslations('activation');
  const done = [hasService, hasHours, chargesEnabled].filter(Boolean).length;
  // Once everything is done there's nothing to nudge; the parent stops rendering
  // this, but guard anyway.
  if (done === 3) return null;

  return (
    <Card className="overflow-hidden border-clay/30">
      <div className="border-b border-line bg-clay/5 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-ink">{t('title')}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {t('subtitle')}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink shadow-card">
            {done}/3
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-bright to-clay shadow-[0_0_10px_rgba(224,163,63,0.5)] transition-all duration-700 ease-spring"
            style={{ width: `${(done / 3) * 100}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-line">
        <Step
          done={hasService}
          icon={Plus}
          title={t('addService.title')}
          description={t('addService.description')}
          action={
            <Link href="/dashboard/services/new">
              <Button size="sm" variant="secondary">
                {t('addService.action')}
                <ArrowRight />
              </Button>
            </Link>
          }
        />
        <Step
          done={hasHours}
          icon={Clock}
          title={t('setHours.title')}
          description={t('setHours.description')}
          action={
            <Link href="/dashboard/availability">
              <Button size="sm" variant="secondary">
                {t('setHours.action')}
                <ArrowRight />
              </Button>
            </Link>
          }
        />
        <StripeStep done={chargesEnabled} onboardingComplete={onboardingComplete} />
      </ul>
    </Card>
  );
}

function Step({
  done,
  icon,
  title,
  description,
  action
}: {
  done: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <StatusIcon done={done} icon={icon} />
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium', done ? 'text-ink-muted line-through' : 'text-ink')}>
          {title}
        </p>
        {!done && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {!done && <div className="shrink-0">{action}</div>}
    </li>
  );
}

function StripeStep({
  done,
  onboardingComplete
}: {
  done: boolean;
  onboardingComplete: boolean;
}) {
  const t = useTranslations('activation');
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
    <li className="flex items-center gap-4 px-6 py-4">
      <StatusIcon done={done} icon={CreditCard} />
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium', done ? 'text-ink-muted line-through' : 'text-ink')}>
          {t('stripe.title')}
        </p>
        {!done && (
          <p className="mt-0.5 text-sm text-ink-muted">
            {onboardingComplete
              ? t('stripe.reviewDescription')
              : t('stripe.description')}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      {!done && (
        <div className="shrink-0">
          <Button
            size="sm"
            variant={onboardingComplete ? 'secondary' : 'primary'}
            onClick={begin}
            disabled={pending}
          >
            {pending ? (
              <>
                <Spinner className="me-2" />
                {t('stripe.opening')}
              </>
            ) : (
              <>
                {onboardingComplete ? t('stripe.continue') : t('stripe.connect')}
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      )}
    </li>
  );
}

function StatusIcon({ done, icon: Icon }: { done: boolean; icon: LucideIcon }) {
  if (done) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/12 text-moss">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-ink-muted">
      <Icon className="h-4 w-4" />
    </span>
  );
}
