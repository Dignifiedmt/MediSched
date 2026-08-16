import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer } from '../components/toast/ToastContainer.jsx';

const ToastContext = createContext(null);

let toastCount = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    // Clear timer if exists
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback((toastData) => {
    const id = toastData.id || `toast-${++toastCount}-${Date.now()}`;
    const duration = toastData.duration !== undefined ? toastData.duration : 4500;

    const newToast = {
      id,
      type: toastData.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toastData.title,
      message: typeof toastData === 'string' ? toastData : toastData.message,
      duration,
      action: toastData.action,
      createdAt: Date.now()
    };

    setToasts((prev) => {
      // Keep max 5 toasts visible to prevent screen overflow
      const updated = [newToast, ...prev.filter((t) => t.id !== id)];
      return updated.slice(0, 5);
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  const toast = useCallback(
    (messageOrOptions, options = {}) => {
      if (typeof messageOrOptions === 'string') {
        return addToast({ message: messageOrOptions, ...options });
      }
      return addToast(messageOrOptions);
    },
    [addToast]
  );

  toast.success = useCallback((message, opts = {}) => {
    return addToast({ type: 'success', message, title: opts.title || 'Success', ...opts });
  }, [addToast]);

  toast.error = useCallback((message, opts = {}) => {
    return addToast({ type: 'error', message, title: opts.title || 'Error', ...opts });
  }, [addToast]);

  toast.warning = useCallback((message, opts = {}) => {
    return addToast({ type: 'warning', message, title: opts.title || 'Notice', ...opts });
  }, [addToast]);

  toast.info = useCallback((message, opts = {}) => {
    return addToast({ type: 'info', message, title: opts.title || 'Information', ...opts });
  }, [addToast]);

  toast.dismiss = dismissToast;
  toast.clear = clearToasts;

  return (
    <ToastContext.Provider value={{ toast, showToast: toast, dismissToast, clearToasts, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
