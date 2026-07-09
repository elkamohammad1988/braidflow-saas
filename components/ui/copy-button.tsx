'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  className?: string;
  label?: string;
};

export function CopyButton({ value, className, label }: Props) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  // Clear the pending "copied → idle" timer if the button unmounts first.
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked — leave the button silent
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center text-sm font-medium transition-colors',
        copied ? 'text-moss' : 'text-ink-muted hover:text-ink',
        className
      )}
    >
      {copied ? t('copied') : label ?? t('copy')}
    </button>
  );
}
