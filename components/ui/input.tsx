import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, hint, error, id, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-11 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm text-ink',
          'placeholder:text-ink-muted/70',
          'focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10',
          error && 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10',
          className
        )}
        {...rest}
      />
      {(hint || error) && (
        <span className={cn('mt-1 block text-xs', error ? 'text-red-600' : 'text-ink-muted')}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
});
