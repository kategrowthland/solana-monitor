import type { ReactNode } from 'react';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1 overflow-auto p-[var(--panel-gap)]">
        {children}
      </main>
      <StatusBar />
    </div>
  );
};
