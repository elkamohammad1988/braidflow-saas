import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean };

export function Card({ className, interactive, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-paper shadow-card',
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lifted',
        className
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-6', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6 pt-2', className)} {...rest} />;
}
