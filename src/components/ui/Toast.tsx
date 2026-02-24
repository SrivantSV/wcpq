import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '380px',
        },
      }}
    />
  );
}

export const toast = {
  success: (message: string, title?: string) =>
    hotToast.custom(
      (t) => (
        <div className={`flex items-start gap-3 ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <p className="font-medium text-neutral-900 text-sm">{title}</p>}
            <p className="text-sm text-neutral-600">{message}</p>
          </div>
          <button onClick={() => hotToast.dismiss(t.id)} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: 4000 }
    ),

  error: (message: string, title?: string) =>
    hotToast.custom(
      (t) => (
        <div className={`flex items-start gap-3 ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <p className="font-medium text-neutral-900 text-sm">{title}</p>}
            <p className="text-sm text-neutral-600">{message}</p>
          </div>
          <button onClick={() => hotToast.dismiss(t.id)} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: 4000 }
    ),

  warning: (message: string, title?: string) =>
    hotToast.custom(
      (t) => (
        <div className={`flex items-start gap-3 ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <p className="font-medium text-neutral-900 text-sm">{title}</p>}
            <p className="text-sm text-neutral-600">{message}</p>
          </div>
          <button onClick={() => hotToast.dismiss(t.id)} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: 4000 }
    ),

  info: (message: string, title?: string) =>
    hotToast.custom(
      (t) => (
        <div className={`flex items-start gap-3 ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <p className="font-medium text-neutral-900 text-sm">{title}</p>}
            <p className="text-sm text-neutral-600">{message}</p>
          </div>
          <button onClick={() => hotToast.dismiss(t.id)} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: 4000 }
    ),
};
