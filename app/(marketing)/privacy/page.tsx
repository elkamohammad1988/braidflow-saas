import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LegalShell, LegalSection } from '@/components/shared/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How BraidFlow collects, uses, and protects your information when you book or accept appointments.',
  alternates: { canonical: '/privacy' }
};

export default function PrivacyPage() {
  const t = useTranslations('legal');
  const strong = (chunks: ReactNode) => <strong className="text-ink">{chunks}</strong>;
  return (
    <LegalShell
      title={t('privacy.title')}
      updated={t('privacy.updatedDate')}
      intro={t('privacy.intro')}
    >
      <LegalSection title={t('privacy.collect.title')}>
        <ul>
          <li>{t.rich('privacy.collect.account', { s: strong })}</li>
          <li>{t.rich('privacy.collect.profile', { s: strong })}</li>
          <li>{t.rich('privacy.collect.booking', { s: strong })}</li>
          <li>{t.rich('privacy.collect.payment', { s: strong })}</li>
          <li>{t.rich('privacy.collect.technical', { s: strong })}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('privacy.use.title')}>
        <ul>
          <li>{t('privacy.use.item1')}</li>
          <li>{t('privacy.use.item2')}</li>
          <li>{t('privacy.use.item3')}</li>
          <li>{t('privacy.use.item4')}</li>
          <li>{t('privacy.use.item5')}</li>
        </ul>
        <p>{t('privacy.use.note')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.share.title')}>
        <p>{t('privacy.share.lead')}</p>
        <ul>
          <li>{t.rich('privacy.share.parties', { s: strong })}</li>
          <li>{t.rich('privacy.share.providers', { s: strong })}</li>
          <li>{t.rich('privacy.share.legal', { s: strong })}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('privacy.payments.title')}>
        <p>{t('privacy.payments.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.cookies.title')}>
        <p>{t('privacy.cookies.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.retention.title')}>
        <p>{t('privacy.retention.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.security.title')}>
        <p>{t('privacy.security.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.rights.title')}>
        <p>
          {t.rich('privacy.rights.body', {
            a: (chunks) => <a href="mailto:privacy@braidflow.app">{chunks}</a>
          })}
        </p>
      </LegalSection>

      <LegalSection title={t('privacy.children.title')}>
        <p>{t('privacy.children.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.changes.title')}>
        <p>{t('privacy.changes.body')}</p>
      </LegalSection>

      <LegalSection title={t('privacy.contact.title')}>
        <p>
          {t.rich('privacy.contact.body', {
            a: (chunks) => <a href="mailto:privacy@braidflow.app">{chunks}</a>,
            terms: (chunks) => <Link href="/terms">{chunks}</Link>
          })}
        </p>
      </LegalSection>
    </LegalShell>
  );
}
