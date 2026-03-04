import { Eye, Search, Command } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { VARIANTS } from '@/types/common';
import type { Variant } from '@/types/common';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { activeVariant, setVariant, toggleCommandPalette } = useUiStore();

  return (
    <header className="h-14 border-b border-[var(--panel-border)] bg-[var(--bg-secondary)] flex items-center justify-between px-5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Eye size={22} className="text-[var(--accent-current)]" />
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            Solana Monitor
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase text-[var(--text-muted)] ml-1">
          by Birdeye
        </span>
      </div>

      {/* Variant Tabs */}
      <nav className="flex items-center gap-1">
        {VARIANTS.map((v) => (
          <VariantTab
            key={v.id}
            variant={v.id}
            label={v.label}
            color={v.accentColor}
            isActive={activeVariant === v.id}
            onClick={() => setVariant(v.id)}
          />
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs"
        >
          <Search size={12} />
          <span>Search</span>
          <kbd className="flex items-center gap-0.5 ml-2 text-[10px] text-[var(--text-muted)]">
            <Command size={10} />K
          </kbd>
        </button>
        <div className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" title="Live" />
      </div>
    </header>
  );
};

// ─── Variant Tab ───────────────────────────────────────────────────

interface VariantTabProps {
  variant: Variant;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const VariantTab = ({ label, color, isActive, onClick }: VariantTabProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition-all duration-200',
      isActive
        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50'
    )}
  >
    <span
      className={cn(
        'w-2 h-2 rounded-full transition-all duration-200',
        isActive ? 'scale-110' : 'opacity-50'
      )}
      style={{ backgroundColor: color }}
    />
    <span className="font-medium">{label}</span>
  </button>
);
