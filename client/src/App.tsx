import type { ReactElement } from 'react';

import { AuthProvider } from './contexts/AuthContext';
import { HelpProvider } from './contexts/HelpContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { AppRouter } from './routing/AppRouter';

export function App(): ReactElement {
  return (
    <AuthProvider>
      <HelpProvider>
        <OnboardingProvider>
          <AppRouter />
        </OnboardingProvider>
      </HelpProvider>
    </AuthProvider>
  );
}
