'use client';

/**
 * Système de notifications « toast » global.
 *
 * `ToastProvider` englobe l'application (cf. `src/app/layout.tsx`) et expose
 * `useToast().showToast(message, type)` à tout composant enfant. Les toasts
 * s'empilent en bas de l'écran (bas-droite sur desktop, pleine largeur sur
 * mobile), se ferment automatiquement après quelques secondes, et peuvent
 * être fermés manuellement.
 *
 * Pensé comme complément — pas remplacement — des `FormBanner` : les erreurs
 * de validation contextuelles restent affichées dans le formulaire, tandis
 * que les toasts confirment une action ponctuelle (sauvegarde, envoi,
 * confirmation de RDV…) sans perturber la mise en page.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  /** Affiche un toast pendant quelques secondes (`type` par défaut : `'info'`). */
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 5000;

const TONE_CLASSES: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-sand bg-warm-white text-ink',
};

const TONE_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '⚠',
  info: 'ℹ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (typeof window !== 'undefined') {
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    }
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Conteneur des toasts : pleine largeur en bas sur mobile, coin bas-droit sur desktop */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-stretch gap-2 p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg sm:w-auto sm:max-w-sm ${TONE_CLASSES[t.type]}`}
          >
            <span aria-hidden className="mt-0.5 shrink-0 text-base leading-none">
              {TONE_ICONS[t.type]}
            </span>
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer la notification"
              className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-base leading-none opacity-50 transition hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Accès au système de toasts. Doit être appelé sous `<ToastProvider>` (cf. `RootLayout`). */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>.');
  }

  return context;
}
