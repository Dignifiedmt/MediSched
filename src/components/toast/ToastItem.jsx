import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight
} from 'lucide-react';

export const ToastItem = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getThemeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800',
          containerBorder: 'border-emerald-200 dark:border-emerald-800/80',
          progressBar: 'bg-emerald-600 dark:bg-emerald-400',
          titleColor: 'text-emerald-950 dark:text-emerald-200',
          defaultTitle: 'Success'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800',
          containerBorder: 'border-rose-200 dark:border-rose-800/80',
          progressBar: 'bg-rose-600 dark:bg-rose-400',
          titleColor: 'text-rose-950 dark:text-rose-200',
          defaultTitle: 'Error'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800',
          containerBorder: 'border-amber-200 dark:border-amber-800/80',
          progressBar: 'bg-amber-600 dark:bg-amber-400',
          titleColor: 'text-amber-950 dark:text-amber-200',
          defaultTitle: 'Attention'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
          iconBg: 'bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800',
          containerBorder: 'border-teal-200 dark:border-teal-800/80',
          progressBar: 'bg-teal-600 dark:bg-teal-400',
          titleColor: 'text-teal-950 dark:text-teal-200',
          defaultTitle: 'Notification'
        };
    }
  };

  const config = getThemeConfig();
  const displayTitle = toast.title || config.defaultTitle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.92, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -12, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`relative pointer-events-auto w-full overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border shadow-xl shadow-slate-900/10 dark:shadow-black/50 transition-all ${config.containerBorder}`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Type Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          {displayTitle && (
            <h5 className={`text-xs font-bold tracking-tight mb-0.5 ${config.titleColor}`}>
              {displayTitle}
            </h5>
          )}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Action button if present */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Close notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar for Auto-dismiss timer */}
      {toast.duration > 0 && (
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: isHovered ? undefined : '0%' }}
            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            className={`h-full ${config.progressBar}`}
          />
        </div>
      )}
    </motion.div>
  );
};
