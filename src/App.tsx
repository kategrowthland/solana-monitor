import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { CommandSearch } from '@/components/shared/CommandSearch';
import { TokenDossier } from '@/features/token-dossier/components/TokenDossier';

const App = () => {
  return (
    <AppShell>
      <Dashboard />
      <CommandSearch />
      <TokenDossier />
    </AppShell>
  );
};

export default App;
