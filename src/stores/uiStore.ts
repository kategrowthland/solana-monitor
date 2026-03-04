import { create } from 'zustand';
import type { Variant } from '@/types/common';

interface UiStore {
  activeVariant: Variant;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  setVariant: (variant: Variant) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeVariant: 'solana',
  sidebarOpen: false,
  commandPaletteOpen: false,
  setVariant: (variant) =>
    set(() => {
      document.documentElement.style.setProperty(
        '--accent-current',
        `var(--accent-${variant})`
      );
      return { activeVariant: variant };
    }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
