import React from 'react';
import { AnimatePresence } from 'motion/react';
import { ToastItem } from './ToastItem.jsx';

export const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <aside
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </aside>
  );
};
