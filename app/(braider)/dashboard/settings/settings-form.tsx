'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, Textarea } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { updateBraiderSettingsAction } from '@/lib/braider/actions';
import { COMMON_TIMEZONES } from '@/lib/timezones';
import { cn } from '@/lib/utils';

type Initial = {
  fullName: string;
  phone: string;
  businessName: string;
  bio: string;
  city: string;
  instagramHandle: string;
  acceptingBookings: boolean;
  timezone: string;
  // Whether Stripe can take charges for this braider. When false, accepting
  // bookings is impossible (no way to collect a deposit), so the toggle is locked.
  chargesEnabled: boolean;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [instagramHandle, setInstagramHandle] = useState(initial.instagramHandle);
  const [acceptingBookings, setAcceptingBookings] = useState(initial.acceptingBookings);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateBraiderSettingsAction({
        fullName,
        phone,
        businessName,
        bio,
        city,
        instagramHandle: instagramHandle.replace(/^@/, ''),
        acceptingBookings,
        timezone
      });
      if ('error' in result) {
        setError(result.error ?? t('settings.genericError'));
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-8"
    >
      <Section
        title={t('settings.bookingSection.title')}
        description={t('settings.bookingSection.description')}
      >
        <Input
          name="businessName"
          label={t('settings.businessName')}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <Textarea
          label={t('settings.bio')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={800}
          placeholder={t('settings.bioPlaceholder')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="city"
            label={t('settings.city')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('settings.cityPlaceholder')}
          />
          <Input
            name="instagramHandle"
            label={t('settings.instagram')}
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder={t('settings.instagramPlaceholder')}
            hint={t('settings.instagramHint')}
          />
        </div>

        <Select
          label={t('settings.timezone')}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          hint={t('settings.timezoneHint')}
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
          {!COMMON_TIMEZONES.some((tz) => tz.value === timezone) && (
            <option value={timezone}>{timezone}</option>
          )}
        </Select>

        <div>
          <label
            className={cn(
              'flex items-center gap-3 rounded-xl border border-line-strong bg-paper px-4 py-3 transition-colors',
              initial.chargesEnabled ? 'cursor-pointer hover:border-clay/30' : 'cursor-not-allowed opacity-60'
            )}
          >
            <input
              type="checkbox"
              checked={acceptingBookings && initial.chargesEnabled}
              onChange={(e) => setAcceptingBookings(e.target.checked)}
              disabled={!initial.chargesEnabled}
              className="h-4 w-4 accent-clay"
            />
            <span className="text-sm">
              <span className="font-medium text-ink">{t('settings.acceptingBookings')}</span>
              <span className="ms-2 text-ink-muted">
                {t('settings.acceptingBookingsHint')}
              </span>
            </span>
          </label>
          {!initial.chargesEnabled && (
            <p className="mt-1.5 text-xs text-clay-text">
              {t('settings.stripeRequired')}
            </p>
          )}
        </div>
      </Section>

      <Section title={t('settings.accountSection.title')} description={t('settings.accountSection.description')}>
        <Input
          name="fullName"
          label={t('settings.yourName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          name="phone"
          label={t('settings.phone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('settings.phonePlaceholder')}
          inputMode="tel"
        />
      </Section>

      {error && (
        <p
          role="alert"
          className="motion-safe:animate-fade-in-up rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="me-2" />
              {t('settings.saving')}
            </>
          ) : (
            t('settings.saveChanges')
          )}
        </Button>
        {saved && !pending && (
          <span role="status" className="motion-safe:animate-fade-in text-sm text-ink-muted">
            {t('settings.saved')}
          </span>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-paper p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
