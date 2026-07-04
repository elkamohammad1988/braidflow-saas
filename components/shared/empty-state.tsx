import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export function EmptyState({ title, description, action, icon: Icon }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl2 border border-dashed border-line-strong bg-cream/40 px-6 py-16 text-center">
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
          <div className="relative mx-auto mb-5 w-fit">
            <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(224,163,63,0.3),transparent_70%)] blur-lg" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-onyx-soft to-night text-gold shadow-[0_10px_28px_-12px_rgba(35,24,16,0.6),inset_0_1px_0_rgba(242,196,100,0.18)] ring-1 ring-gold/25">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
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
