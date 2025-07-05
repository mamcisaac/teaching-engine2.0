/**
 * State Management Migration Guide
 *
 * This file provides guidance and utilities for migrating from the old context-based
 * state management to the new standardized Zustand + React Query approach.
 */

// Migration mappings for Context API → Zustand Store conversions
export const CONTEXT_TO_STORE_MAPPINGS = {
  // Onboarding Context → Onboarding Store
  useOnboarding: 'useOnboardingStore',
  OnboardingProvider: 'remove - use store directly',
  useOnboardingComplete: 'useOnboardingComplete (from store)',

  // Help Context → Help Store
  useHelp: 'useHelpStore',
  HelpProvider: 'remove - use store directly',
  useTutorialProgress: 'useTutorialProgress (from store)',
  useHelpAnalytics: 'useHelpAnalytics (from store)',

  // Keyboard Shortcuts Context → Keyboard Shortcuts Store
  useKeyboardShortcuts: 'useKeyboardShortcutsStore',
  KeyboardShortcutsProvider: 'remove - use store directly',
  formatShortcut: 'formatShortcut (from store)',

  // Language Context → Language Store
  useLanguage: 'useLanguageStore',
  LanguageProvider: 'remove - use store directly',
  't()': 'useTranslation() hook',
  'getLocalizedField()': 'useLocalizedField() hook',

  // Theme Context → UI Store
  useTheme: 'useTheme (from uiStore)',
  ThemeProvider: 'remove - use UI store directly',
  toggleTheme: 'theme.toggleTheme from useTheme hook',

  // Auth Context → Enhanced Auth Context (React Query)
  useAuth: 'useAuth (enhanced with React Query)',
  AuthProvider: 'AuthProvider (enhanced)',

  // Notification Context → Enhanced Notification Context (React Query)
  useNotification: 'useNotification (enhanced)',
  NotificationProvider: 'NotificationProvider (enhanced)',
};

// Code transformation examples
export const MIGRATION_EXAMPLES = {
  onboarding: {
    before: `
// Old Context API approach
import { useOnboarding } from '../contexts/OnboardingContext';

const Component = () => {
  const { 
    startOnboarding, 
    currentStep, 
    isOnboardingActive 
  } = useOnboarding();
  
  return (
    <div>
      {isOnboardingActive && <TutorialStep step={currentStep} />}
    </div>
  );
};
    `,
    after: `
// New Zustand Store approach
import { 
  useOnboardingStore, 
  useCurrentStep, 
  useOnboardingActive 
} from '../stores/onboardingStore';

const Component = () => {
  const startOnboarding = useOnboardingStore(state => state.startOnboarding);
  const currentStep = useCurrentStep();
  const isOnboardingActive = useOnboardingActive();
  
  return (
    <div>
      {isOnboardingActive && <TutorialStep step={currentStep} />}
    </div>
  );
};
    `,
  },

  help: {
    before: `
// Old Context API approach
import { useHelp } from '../contexts/HelpContext';

const Component = () => {
  const { 
    setCurrentSection, 
    state: { currentSection, searchQuery } 
  } = useHelp();
  
  return <HelpPanel section={currentSection} />;
};
    `,
    after: `
// New Zustand Store approach
import { useHelpStore, useCurrentSection } from '../stores/helpStore';

const Component = () => {
  const setCurrentSection = useHelpStore(state => state.setCurrentSection);
  const currentSection = useCurrentSection();
  
  return <HelpPanel section={currentSection} />;
};
    `,
  },

  theme: {
    before: `
// Old Context API approach
import { useTheme } from '../contexts/ThemeContext';

const Component = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
};
    `,
    after: `
// New UI Store approach
import { useTheme } from '../stores/uiStore';

const Component = () => {
  const { effectiveTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {effectiveTheme}
    </button>
  );
};
    `,
  },

  language: {
    before: `
// Old Context API approach
import { useLanguage } from '../contexts/LanguageContext';

const Component = () => {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome_title')}</h1>
      <button onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}>
        Switch Language
      </button>
    </div>
  );
};
    `,
    after: `
// New Language Store approach
import { useLanguageStore, useTranslation } from '../stores/languageStore';

const Component = () => {
  const t = useTranslation();
  const { language, setLanguage } = useLanguageStore(state => ({
    language: state.language,
    setLanguage: state.setLanguage
  }));
  
  return (
    <div>
      <h1>{t('welcome_title')}</h1>
      <button onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}>
        Switch Language
      </button>
    </div>
  );
};
    `,
  },
};

// Provider setup migration
export const PROVIDER_MIGRATION = {
  before: `
// Old App.tsx with multiple providers
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <OnboardingProvider>
      <HelpProvider>
        <KeyboardShortcutsProvider>
          <LanguageProvider>
            <ThemeProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </ThemeProvider>
          </LanguageProvider>
        </KeyboardShortcutsProvider>
      </HelpProvider>
    </OnboardingProvider>
  </AuthProvider>
</QueryClientProvider>
  `,
  after: `
// New App.tsx with minimal providers
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
</QueryClientProvider>

// Note: Zustand stores are available globally without providers
// UI Store, Language Store, Help Store, etc. work automatically
  `,
};

// Performance optimization tips
export const PERFORMANCE_TIPS = [
  'Use selector hooks to prevent unnecessary re-renders',
  'Prefer specific selectors over accessing entire store state',
  'Use React Query for server state, Zustand for client state',
  'Keep Zustand stores focused on specific domains',
  'Use immer middleware for complex state updates',
  'Persist only necessary state to localStorage',
  'Use subscribeWithSelector for performance optimization',
];

// Testing migration guide
export const TESTING_MIGRATION = {
  before: `
// Old test setup with providers
const renderWithProviders = (component) => {
  return render(
    <OnboardingProvider>
      <HelpProvider>
        {component}
      </HelpProvider>
    </OnboardingProvider>
  );
};
  `,
  after: `
// New test setup with store cleanup
import { useOnboardingStore } from '../stores/onboardingStore';

beforeEach(() => {
  // Reset store state before each test
  useOnboardingStore.getState().resetOnboarding();
});

const renderWithStores = (component) => {
  return render(component); // No providers needed for Zustand stores
};
  `,
};

// Utility function to check if migration is needed
export const checkMigrationNeeded = (filePath: string, content: string): boolean => {
  const oldPatterns = [
    'useOnboarding',
    'OnboardingProvider',
    'useHelp',
    'HelpProvider',
    'useKeyboardShortcuts',
    'KeyboardShortcutsProvider',
    'useLanguage',
    'LanguageProvider',
    'useTheme',
    'ThemeProvider',
  ];

  return oldPatterns.some((pattern) => content.includes(pattern));
};

// Generate migration checklist for a component
export const generateMigrationChecklist = (_componentPath: string): string[] => {
  return [
    '□ Replace Context imports with Store imports',
    '□ Remove Provider wrapper from component tree',
    '□ Update hook usage to use Zustand selectors',
    '□ Test component functionality',
    '□ Update tests to reset store state',
    '□ Verify no performance regressions',
    '□ Update TypeScript types if needed',
  ];
};
