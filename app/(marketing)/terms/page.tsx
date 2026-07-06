import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LegalShell, LegalSection } from '@/components/shared/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern your use of BraidFlow as a client booking appointments or a braider accepting them.',
  alternates: { canonical: '/terms' }
};

export default function TermsPage() {
  const t = useTranslations('legal');
  return (
    <LegalShell
      title={t('terms.title')}
      updated={t('terms.updatedDate')}
      intro={t('terms.intro')}
    >
      <LegalSection title={t('terms.s1.title')}>
        <p>{t('terms.s1.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s2.title')}>
        <p>{t('terms.s2.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s3.title')}>
        <p>{t('terms.s3.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s4.title')}>
        <p>{t('terms.s4.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s5.title')}>
        <p>{t('terms.s5.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s6.title')}>
        <p>{t('terms.s6.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s7.title')}>
        <ul>
          <li>{t('terms.s7.item1')}</li>
          <li>{t('terms.s7.item2')}</li>
          <li>{t('terms.s7.item3')}</li>
          <li>{t('terms.s7.item4')}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('terms.s8.title')}>
        <p>{t('terms.s8.lead')}</p>
        <ul>
          <li>{t('terms.s8.item1')}</li>
          <li>{t('terms.s8.item2')}</li>
          <li>{t('terms.s8.item3')}</li>
          <li>{t('terms.s8.item4')}</li>
          <li>{t('terms.s8.item5')}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('terms.s9.title')}>
        <p>{t('terms.s9.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s10.title')}>
        <p>{t('terms.s10.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s11.title')}>
        <p>{t('terms.s11.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s12.title')}>
        <p>{t('terms.s12.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s13.title')}>
        <p>{t('terms.s13.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s14.title')}>
        <p>{t('terms.s14.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s15.title')}>
        <p>{t('terms.s15.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s16.title')}>
        <p>{t('terms.s16.body')}</p>
      </LegalSection>

      <LegalSection title={t('terms.s17.title')}>
        <p>
          {t.rich('terms.s17.body', {
            a: (chunks) => <a href="mailto:legal@braidflow.app">{chunks}</a>,
            privacy: (chunks) => <Link href="/privacy">{chunks}</Link>
          })}
        </p>
      </LegalSection>
    </LegalShell>
  );
}
