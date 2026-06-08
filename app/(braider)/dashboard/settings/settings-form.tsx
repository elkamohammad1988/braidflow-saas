'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { updateBraiderSettingsAction } from '@/lib/braider/actions';

type Initial = {
  fullName: string;
  phone: string;
  businessName: string;
  bio: string;
  city: string;
  instagramHandle: string;
  acceptingBookings: boolean;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [instagramHandle, setInstagramHandle] = useState(initial.instagramHandle);
  const [acceptingBookings, setAcceptingBookings] = useState(initial.acceptingBookings);
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
        acceptingBookings
      });
      if ('error' in result) {
        setError(result.error ?? 'Something went wrong.');
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
        title="Your booking page"
        description="What clients see when they land on your link."
      >
        <Input
          name="businessName"
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={800}
            placeholder="Style specialties, years of experience, what makes you, you."
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="city"
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Atlanta, GA"
          />
          <Input
            name="instagramHandle"
            label="Instagram"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder="braidsbyyou"
            hint="Without the @."
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={acceptingBookings}
            onChange={(e) => setAcceptingBookings(e.target.checked)}
            className="h-4 w-4 accent-ink"
          />
          <span className="text-sm">
            <span className="font-medium text-ink">Accepting new bookings</span>
            <span className="ml-2 text-ink-muted">
              Uncheck to pause your page without taking it down.
            </span>
          </span>
        </label>
      </Section>

      <Section title="Account" description="Only you see this.">
        <Input
          name="fullName"
          label="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          name="phone"
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          inputMode="tel"
        />
      </Section>

      {error && (
        <p className="motion-safe:animate-fade-in-up rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="mr-2" />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
        {saved && !pending && (
          <span className="motion-safe:animate-fade-in text-sm text-ink-muted">
            Saved.
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
    <section className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
