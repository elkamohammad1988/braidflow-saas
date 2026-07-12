import type { LucideIcon } from 'lucide-react';
import { GlassIcon } from '@/components/ui/glass-icon';

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export function EmptyState({ title, description, action, icon: Icon }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl2 border border-dashed border-line-strong bg-cream/40 px-6 py-12 text-center">
      {/* faint woven strands drifting behind the mark */}
      <svg
        aria-hidden
        viewBox="0 0 400 160"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-clay/[0.09]"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1">
          {Array.from({ length: 5 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${30 + i * 25} C 90 ${10 + i * 25}, 150 ${52 + i * 25}, 240 ${30 + i * 25} S 380 ${10 + i * 25}, 440 ${34 + i * 25}`}
            />
          ))}
        </g>
      </svg>

      <div className="relative">
        {Icon && (
          <div className="mx-auto mb-5 w-fit">
            <GlassIcon icon={Icon} tone="accent" size="lg" />
          </div>
        )}
        <p className="font-display text-xl font-medium text-ink">{title}</p>
        {description && (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
