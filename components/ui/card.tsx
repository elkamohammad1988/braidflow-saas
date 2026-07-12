import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean };

export function Card({ className, interactive, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        // `glass-edge` traces a lit hairline along the top so the card reads as a
        // physical glass panel, not a flat rectangle.
        'glass-edge rounded-card border border-line bg-paper shadow-card',
        interactive &&
          'transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-clay/40 hover:shadow-lifted active:translate-y-0 active:shadow-card active:duration-100',
        className
      )}
      {...rest}
    />
  );
}

// Padding compacted ~20% for a denser, more premium rhythm.
export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...rest} />;
}
