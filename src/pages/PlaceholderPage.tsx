import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <Construction className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500 max-w-sm">
        {description ?? 'This section is part of Phase 2 development. Navigation and structure are ready.'}
      </p>
      <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-3">
        <p className="text-xs text-neutral-400">Coming in Phase 2 →</p>
      </div>
    </div>
  );
}
