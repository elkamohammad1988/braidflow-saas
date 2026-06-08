import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export function EmptyState({ title, description, action, icon: Icon }: Props) {
  return (
    <div className="rounded-card border border-dashed border-ink/15 bg-cream/40 px-6 py-16 text-center">
      {Icon && (
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper text-ink-muted shadow-card">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}
      <p className="font-display text-lg text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
