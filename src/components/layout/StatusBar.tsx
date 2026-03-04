import { useUiStore } from '@/stores/uiStore';
import { VARIANTS } from '@/types/common';
import { Wifi } from 'lucide-react';

export const StatusBar = () => {
  const activeVariant = useUiStore((s) => s.activeVariant);
  const config = VARIANTS.find((v) => v.id === activeVariant);

  return (
    <div className="h-7 border-t border-[var(--panel-border)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 text-[10px] text-[var(--text-muted)] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Wifi size={10} className="text-[var(--positive)]" />
          <span>Connected</span>
        </div>
        <span className="opacity-40">|</span>
        <span>Solana Mainnet</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="mono">
          Variant:{' '}
          <span style={{ color: config?.accentColor }}>{config?.label}</span>
        </span>
        <span className="opacity-40">|</span>
        <span className="mono">Powered by Birdeye Data Services</span>
      </div>
    </div>
  );
};
