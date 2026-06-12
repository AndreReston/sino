import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, ToastType } from '../store/toastStore';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 shrink-0" />,
  error: <XCircle className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/15 border-red-500/30 text-red-300',
  info: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium pointer-events-auto backdrop-blur-sm animate-slide-in ${STYLES[t.type]}`}
          style={{ maxWidth: 360 }}
        >
          {ICONS[t.type]}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity ml-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
