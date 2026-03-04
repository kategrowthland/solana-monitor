import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, TrendingUp } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useTokenStore } from '@/stores/tokenStore';
import { useTokenSearch } from '@/hooks/useTokenSearch';
import { formatPrice, formatCompact, formatPercent } from '@/utils/formatNumber';
import { cn } from '@/lib/utils';
import type { BirdeyeSearchResult } from '@/types/birdeye';

export const CommandSearch = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const { selectToken } = useTokenStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useTokenSearch(query);

  const results = data?.items ?? [];

  // ─── Global ⌘K shortcut ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
  }, [setCommandPaletteOpen]);

  const handleSelect = useCallback(
    (token: BirdeyeSearchResult) => {
      selectToken(token.address, token.symbol, token.logoURI);
      close();
    },
    [selectToken, close]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-[var(--bg-panel)] border border-[var(--panel-border)] rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--panel-border)]">
                <Search size={16} className="text-[var(--text-muted)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tokens by name, symbol, or address..."
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
                {isLoading && (
                  <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />
                )}
                <button onClick={close} className="p-1 rounded hover:bg-[var(--bg-hover)]">
                  <X size={14} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto">
                {query.length < 2 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <TrendingUp size={20} className="text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-muted)]">
                      Type at least 2 characters to search
                    </p>
                  </div>
                ) : results.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <Search size={20} className="text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-muted)]">
                      No tokens found for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {results.map((token, i) => (
                      <SearchResultRow
                        key={`${token.address}-${i}`}
                        token={token}
                        isSelected={i === selectedIndex}
                        onClick={() => handleSelect(token)}
                        onHover={() => setSelectedIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--panel-border)] text-[10px] text-[var(--text-muted)]">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-[var(--bg-hover)] text-[9px]">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-[var(--bg-hover)] text-[9px]">↵</kbd> select
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-[var(--bg-hover)] text-[9px]">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Search Result Row ─────────────────────────────────────────────

interface SearchResultRowProps {
  token: BirdeyeSearchResult;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
}

const SearchResultRow = ({ token, isSelected, onClick, onHover }: SearchResultRowProps) => {
  const change = token.price24hChangePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
        isSelected ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]/50'
      )}
    >
      {/* Logo */}
      {token.logoURI ? (
        <img
          src={token.logoURI}
          alt={token.symbol}
          className="w-7 h-7 rounded-full shrink-0 bg-[var(--bg-hover)]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-7 h-7 rounded-full shrink-0 bg-[var(--bg-hover)] flex items-center justify-center">
          <span className="text-[10px] text-[var(--text-muted)] uppercase">{token.symbol?.slice(0, 2)}</span>
        </div>
      )}

      {/* Name + symbol */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-[var(--text-primary)] truncate">
          {token.name}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          {token.symbol}
        </span>
      </div>

      {/* Price + change */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-xs mono text-[var(--text-primary)] tabular-nums">
          {formatPrice(token.price)}
        </span>
        <span
          className={cn(
            'text-[10px] mono tabular-nums',
            isPositive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
          )}
        >
          {formatPercent(change)}
        </span>
      </div>

      {/* Volume */}
      <div className="flex flex-col items-end shrink-0 w-16">
        <span className="text-[10px] text-[var(--text-muted)]">Vol 24h</span>
        <span className="text-[10px] mono text-[var(--text-secondary)] tabular-nums">
          ${formatCompact(token.volume24hUSD ?? 0)}
        </span>
      </div>
    </div>
  );
};
