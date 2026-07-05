import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The warm-paper field surface — one source of truth for every form control
 * (Input, Textarea, Select, and one-off date/time inputs). No height, width, or
 * padding here so each control sets its own; compose with
 * `cn(fieldSurface, 'h-11 w-full px-3.5')`.
 */
export const fieldSurface =
  'rounded-xl border border-line-strong bg-paper text-sm text-ink ' +
  'shadow-[inset_0_1px_2px_rgba(35,24,16,0.04)] placeholder:text-ink-subtle ' +
  'transition-colors focus-visible:border-clay focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-clay/50 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/** Error register — a warm red border + ring, layered over `fieldSurface`. */
export const fieldInvalid =
  'border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/30';

/** Stable id for a field's hint/error description, tied via `aria-describedby`. */
export function describedById(id: string | undefined, hasText: boolean): string | undefined {
  return hasText && id ? `${id}-desc` : undefined;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children
}: {
  id?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  const descId = describedById(id, Boolean(hint || error));
  return (
    <div className="block">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
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
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, ...rest },
  ref
) {
  const fieldId = id ?? rest.name;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById(fieldId, Boolean(hint || error))}
        className={cn(
          fieldSurface,
          'min-h-[96px] w-full resize-y px-3.5 py-2.5 leading-relaxed',
          error && fieldInvalid,
          className
        )}
        {...rest}
      />
    </FieldShell>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, id, children, ...rest },
  ref
) {
  const fieldId = id ?? rest.name;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById(fieldId, Boolean(hint || error))}
          className={cn(
            fieldSurface,
            'h-11 w-full cursor-pointer appearance-none px-3.5 pr-10',
            error && fieldInvalid,
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        />
      </div>
    </FieldShell>
  );
});
