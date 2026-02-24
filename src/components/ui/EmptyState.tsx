import { cn } from '@/lib/utils';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  heading: string;
  subtext: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, heading, subtext, ctaLabel, onCta, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Icon className="h-8 w-8 text-neutral-400" />
        </div>
      )}
      {!Icon && (
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-neutral-300">
            <rect width="64" height="64" rx="32" fill="currentColor" fillOpacity="0.3" />
            <path
              d="M22 32h20M22 24h20M22 40h12"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{subtext}</p>
      {ctaLabel && onCta && (
        <Button className="mt-4" size="sm" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
