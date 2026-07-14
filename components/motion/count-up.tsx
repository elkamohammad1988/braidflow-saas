import { useLocale } from 'next-intl';

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Renders a formatted number. This used to count up from 0 to `to` on scroll,
 * which meant the SSR HTML shipped the placeholder 0 and the real figure only
 * appeared ~1.6s later — or never, if JS was slow. The true value is content, so
 * it now renders immediately and identically on the server and client.
 */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', className }: Props) {
  const locale = useLocale();
  return (
    <span className={className}>
      {prefix}
      {to.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}
