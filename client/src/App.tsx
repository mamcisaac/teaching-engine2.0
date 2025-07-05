import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { HelpProvider } from './contexts/HelpContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { GlobalErrorBoundary } from './components/ErrorBoundaries';
import { AppAuthErrorBoundary } from './components/AuthErrorBoundary';
import { OfflineNotification } from './components/OfflineNotification';
import { GlobalKeyboardShortcuts } from './components/GlobalKeyboardShortcuts';
import { AppRouter } from './routing/AppRouter';

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <AppAuthErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <HelpProvider>
                  <OnboardingProvider>
                    <KeyboardShortcutsProvider>
                      <AppRouter />
                      <GlobalKeyboardShortcuts />
                      <OfflineNotification />
                    </KeyboardShortcutsProvider>
                  </OnboardingProvider>
                </HelpProvider>
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AppAuthErrorBoundary>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
