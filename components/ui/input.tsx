import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { fieldInvalid, fieldSurface, describedById } from './field';

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
  const descId = describedById(inputId, Boolean(hint || error));
  return (
    <div className="block">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descId}
        className={cn(fieldSurface, 'h-11 w-full px-3.5', error && fieldInvalid, className)}
        {...rest}
      />
      {(hint || error) && (
        <span
          id={descId}
          role={error ? 'alert' : undefined}
          className={cn(
            'mt-1.5 block text-xs',
            error ? 'text-red-600 dark:text-red-400' : 'text-ink-muted'
          )}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
});
