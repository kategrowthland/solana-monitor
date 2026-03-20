import { useUiStore } from '@/stores/uiStore';
import { VARIANTS } from '@/types/common';
import { Wifi } from 'lucide-react';

export const StatusBar = () => {
  const activeVariant = useUiStore((s) => s.activeVariant);
  const config = VARIANTS.find((v) => v.id === activeVariant);

  return (
    <div className="h-7 border-t border-border bg-card flex items-center justify-between px-4 text-[10px] text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Wifi size={10} className="animate-pulse-glow" style={{ color: 'var(--be-trust-teal)' }} />
          <span>Connected</span>
        </div>
        <span className="opacity-40">|</span>
        <span>Solana Mainnet</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono">
          Variant:{' '}
          <span style={{ color: config?.accentColor }}>{config?.label}</span>
        </span>
        <span className="opacity-40">|</span>
        <span className="font-mono">Powered by BIRDEYE Data Services</span>
      </div>
    </div>
  );
};
