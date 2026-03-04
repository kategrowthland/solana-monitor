import { create } from 'zustand';

interface TokenStore {
  selectedTokenAddress: string | null;
  selectedTokenSymbol: string | null;
  selectedTokenLogo: string | null;
  dossierOpen: boolean;
  selectToken: (address: string, symbol: string, logo?: string) => void;
  closeDossier: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  selectedTokenAddress: null,
  selectedTokenSymbol: null,
  selectedTokenLogo: null,
  dossierOpen: false,
  selectToken: (address, symbol, logo) =>
    set({
      selectedTokenAddress: address,
      selectedTokenSymbol: symbol,
      selectedTokenLogo: logo ?? null,
      dossierOpen: true,
    }),
  closeDossier: () => set({ dossierOpen: false }),
}));
