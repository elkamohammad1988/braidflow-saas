import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/shared/status-screen';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <StatusScreen
      code="404"
      title={t('notFound.title')}
      description={t('notFound.description')}
    >
      <Link href="/">
        <Button size="lg">{t('backToHome')}</Button>
      </Link>
      <Link
        href="/braiders"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-clay"
      >
        {t('notFound.browseBraiders')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </StatusScreen>
  );
}
