import type { ReactElement } from 'react';

import { AuthProvider } from './contexts/AuthContext';
import { HelpProvider } from './contexts/HelpContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { AppRouter } from './routing/AppRouter';

export function App(): ReactElement {
  console.log('[App] Rendering App component with all providers');
  
  return (
    <AuthProvider>
      <KeyboardShortcutsProvider>
        <HelpProvider>
          <OnboardingProvider>
            <AppRouter />
          </OnboardingProvider>
        </HelpProvider>
      </KeyboardShortcutsProvider>
    </AuthProvider>
  );
}
