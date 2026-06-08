'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  className?: string;
  label?: string;
};

export function CopyButton({ value, className, label = 'Copy' }: Props) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
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
      {copied ? 'Copied' : label}
    </button>
  );
}
