import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  collapsible?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  noPadding?: boolean;
}

export const Panel = ({
  title,
  icon,
  children,
  className,
  headerAction,
  collapsible = false,
  loading = false,
  error = null,
  onRetry,
  noPadding = false,
}: PanelProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'rounded-[var(--panel-radius)] border border-[var(--panel-border)] overflow-hidden',
        'bg-[var(--bg-panel)]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-panel-header)] border-b border-[var(--panel-border)]">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-[var(--accent-current)] opacity-80">
              {icon}
            </span>
          )}
          <h3 className="text-sm font-medium text-[var(--text-primary)] tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ChevronDown
                size={14}
                className={cn(
                  'text-[var(--text-muted)] transition-transform duration-200',
                  collapsed && '-rotate-90'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={noPadding ? '' : 'p-4'}>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    size={20}
                    className="animate-spin text-[var(--text-muted)]"
                  />
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <AlertCircle size={20} className="text-[var(--negative)]" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    {error}
                  </p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="text-xs px-3 py-1.5 rounded-md bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
