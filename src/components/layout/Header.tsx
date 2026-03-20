import { Search, Wifi } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';

export const Header = () => {
  const { toggleCommandPalette } = useUiStore();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/Secondary_Lockup_White.svg"
            alt="BIRDEYE"
            className="h-5 w-auto"
          />
          <span className="text-muted-foreground text-xs hidden sm:inline opacity-40">|</span>
          <span className="text-sm font-medium tracking-tight text-muted-foreground hidden sm:inline">
            Solana Monitor
          </span>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border bg-transparent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search size={13} />
          <span className="text-xs">Search tokens...</span>
          <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1.5">
          <Wifi className="h-3.5 w-3.5 animate-pulse-glow" style={{ color: 'var(--be-trust-teal)' }} />
          <span className="text-[10px] rounded-full px-2 py-0.5 font-medium tracking-wide border" style={{ color: 'var(--be-trust-teal)', borderColor: 'color-mix(in srgb, var(--be-trust-teal) 30%, transparent)' }}>
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
};

