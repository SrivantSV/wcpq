import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  locked?: boolean;
  lockedTooltip?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, locked, lockedTooltip, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    if (locked) {
      return (
        <div className="flex flex-col gap-1">
          {label && (
            <label className="text-sm font-medium text-neutral-700">
              {label}
            </label>
          )}
          <div className="group relative flex items-center">
            <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500 cursor-not-allowed">
              {leftIcon && <span className="text-neutral-400">{leftIcon}</span>}
              <span>{props.value || props.defaultValue || '—'}</span>
              <Lock className="ml-auto h-3.5 w-3.5 text-neutral-400" />
            </div>
            {lockedTooltip && (
              <div className="absolute -top-8 left-0 z-10 hidden rounded bg-neutral-800 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                {lockedTooltip}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-neutral-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-9 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#1B4F9C] focus:ring-offset-0 focus:border-[#1B4F9C]',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500',
              error
                ? 'border-[#dc2626] focus:ring-[#dc2626] focus:border-[#dc2626]'
                : 'border-neutral-300 hover:border-neutral-400',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-neutral-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
