import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, kind = 'info') => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-lg ring-1 backdrop-blur ${
              t.kind === 'error'
                ? 'bg-red-600/95 text-white ring-red-700'
                : 'bg-slate-900/95 text-white ring-slate-700'}`}>
            {t.kind === 'error'
              ? <AlertCircle className="h-4 w-4" />
              : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"><X className="h-4 w-4 opacity-70" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
