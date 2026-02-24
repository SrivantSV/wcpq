import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-[#1B4F9C] focus:border-[#1B4F9C]',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            error ? 'border-[#dc2626] focus:ring-[#dc2626]' : 'border-neutral-300 hover:border-neutral-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
