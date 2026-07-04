type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="label mb-2.5 flex items-center gap-2 text-clay-text">
            <span className="h-1 w-1 rounded-full bg-clay" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[2rem] font-medium leading-[1.05] tracking-[-0.03em] text-ink md:text-[2.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
