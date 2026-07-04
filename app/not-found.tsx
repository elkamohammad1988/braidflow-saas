import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/shared/status-screen';

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="That page slipped through the braid."
      description="The link might be old, or the page never existed. Either way — we'll get you back on track."
    >
      <Link href="/">
        <Button size="lg">Back to home</Button>
      </Link>
      <Link
        href="/braiders"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-clay"
      >
        Or browse braiders
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </StatusScreen>
  );
}
