import { cn, initials } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-11 w-11'
};

/**
 * The house identity chip — a person's initials set in a soft violet disc. One
 * source of truth for the signed-in braider (sidebar + mobile bar) and every
 * client row across the dashboard, so the avatar reads identically everywhere.
 */
export function InitialsAvatar({
  name,
  size = 'md',
  fallback = '—',
  className
}: {
  name: string;
  size?: Size;
  fallback?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-clay/12 text-sm font-semibold text-clay-text',
        sizes[size],
        className
      )}
    >
      {initials(name) || fallback}
    </span>
  );
}
