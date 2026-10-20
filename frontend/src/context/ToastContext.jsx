// Small pop-up messages (replaces the browser alert()).
// Usage:  const toast = useToast();  toast.success("Saved!");
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 4500); // auto close
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push]
  );

  const icons = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={20} />
              <span>{t.message}</span>
              <button onClick={() => remove(t.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
