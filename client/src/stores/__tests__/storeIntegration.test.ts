import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from '../onboardingStore';
import { useHelpStore } from '../helpStore';
import { useKeyboardShortcutsStore } from '../keyboardShortcutsStore';
import { useLanguageStore } from '../languageStore';
import { useUIStore } from '../uiStore';

// Test that all stores are properly configured and work together
describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useOnboardingStore.getState().resetOnboarding();
    useHelpStore.setState({
      currentSection: null,
      searchQuery: '',
      activeFilters: [],
      tutorialProgress: {},
      completedTutorials: [],
      showOnboarding: false,
      contextualHints: true,
      userProgress: {
        helpPagesViewed: [],
        tutorialsCompleted: [],
        totalTimeSpent: 0,
        lastVisited: new Date()
      }
    });
    useKeyboardShortcutsStore.getState().stopListening();
    useLanguageStore.getState().setLanguage('en');
    useUIStore.setState({
      theme: 'light',
      effectiveTheme: 'light',
      sidebarCollapsed: false,
      activeModals: [],
      activeToasts: [],
    });
  });

  it('onboarding store should handle flow management', () => {
    const store = useOnboardingStore.getState();
    
    // Start onboarding
    store.startOnboarding('main-onboarding');
    
    const state = useOnboardingStore.getState();
    expect(state.isOnboardingActive).toBe(true);
    expect(state.currentFlow?.id).toBe('main-onboarding');
    expect(state.currentStepIndex).toBe(0);
    expect(state.currentStep?.id).toBe('welcome');
    
    // Move to next step
    store.nextStep();
    expect(useOnboardingStore.getState().currentStepIndex).toBe(1);
    
    // Complete onboarding
    store.completeOnboarding();
    const finalState = useOnboardingStore.getState();
    expect(finalState.isOnboardingActive).toBe(false);
    expect(finalState.completedFlows).toContain('main-onboarding');
  });

  it('help store should manage tutorial progress', () => {
    const store = useHelpStore.getState();
    
    // Start tutorial
    store.startTutorial('it-tutorial');
    expect(store.getTutorialProgress('it-tutorial').isActive).toBe(true);
    expect(store.getTutorialProgress('it-tutorial').currentStep).toBe(0);
    
    // Progress through tutorial
    store.nextTutorialStep('it-tutorial');
    expect(store.getTutorialProgress('it-tutorial').currentStep).toBe(1);
    
    // Complete tutorial
    store.completeTutorial('it-tutorial');
    expect(store.getTutorialProgress('it-tutorial').isCompleted).toBe(true);
    expect(store.getTutorialProgress('it-tutorial').isActive).toBe(false);
  });

  it('keyboard shortcuts store should register and handle shortcuts', () => {
    const store = useKeyboardShortcutsStore.getState();
    
    const mockHandler = vi.fn();
    const shortcut = {
      id: 'it-shortcut',
      key: 't',
      ctrl: true,
      description: 'Test shortcut',
      category: 'global' as const,
      handler: mockHandler,
    };
    
    // Register shortcut
    store.registerShortcut(shortcut);
    const state = useKeyboardShortcutsStore.getState();
    expect(state.shortcuts).toHaveLength(1);
    expect(state.shortcuts[0].id).toBe('it-shortcut');
    
    // Unregister shortcut
    store.unregisterShortcut('it-shortcut');
    expect(useKeyboardShortcutsStore.getState().shortcuts).toHaveLength(0);
  });

  it('language store should handle translations', () => {
    const store = useLanguageStore.getState();
    
    // Test English
    expect(store.language).toBe('en');
    expect(store.t('save')).toBe('Save');
    expect(store.isEnglish).toBe(true);
    expect(store.isFrench).toBe(false);
    
    // Switch to French
    store.setLanguage('fr');
    const frenchState = useLanguageStore.getState();
    expect(frenchState.language).toBe('fr');
    expect(frenchState.t('save')).toBe('Enregistrer');
    expect(frenchState.isEnglish).toBe(false);
    expect(frenchState.isFrench).toBe(true);
    
    // Test substitutions
    expect(frenchState.t('step_x_of_y', undefined, ['1', '5'])).toBe('Étape 1 de 5');
  });

  it('UI store should manage theme and modals', () => {
    const store = useUIStore.getState();
    
    // Test theme management
    expect(store.theme).toBe('light');
    expect(store.effectiveTheme).toBe('light');
    
    store.setTheme('dark');
    expect(useUIStore.getState().effectiveTheme).toBe('dark');
    
    // Test modal management
    store.openModal('it-modal');
    expect(store.isModalOpen('it-modal')).toBe(true);
    expect(useUIStore.getState().activeModals).toContain('it-modal');
    
    store.closeModal('it-modal');
    expect(useUIStore.getState().isModalOpen('it-modal')).toBe(false);
    
    // Test toast management
    store.showToast('Test message', 'success');
    const toastState = useUIStore.getState();
    expect(toastState.activeToasts).toHaveLength(1);
    expect(toastState.activeToasts[0].message).toBe('Test message');
    expect(toastState.activeToasts[0].type).toBe('success');
  });

  it('stores should work together for complex workflows', () => {
    // Start onboarding in French with dark theme
    useLanguageStore.getState().setLanguage('fr');
    useUIStore.getState().setTheme('dark');
    useOnboardingStore.getState().startOnboarding('main-onboarding');
    
    // Check that all stores maintain their state
    expect(useLanguageStore.getState().language).toBe('fr');
    expect(useUIStore.getState().effectiveTheme).toBe('dark');
    expect(useOnboardingStore.getState().isOnboardingActive).toBe(true);
    
    // Show help while onboarding is active
    useHelpStore.getState().setCurrentSection('getting-started');
    expect(useHelpStore.getState().currentSection).toBe('getting-started');
    
    // Complete onboarding should not affect other stores
    useOnboardingStore.getState().completeOnboarding();
    expect(useLanguageStore.getState().language).toBe('fr');
    expect(useUIStore.getState().effectiveTheme).toBe('dark');
    expect(useHelpStore.getState().currentSection).toBe('getting-started');
  });

  it('stores should persist important state', () => {
    // Change settings that should persist
    useLanguageStore.getState().setLanguage('fr');
    useUIStore.getState().setTheme('dark');
    useUIStore.getState().setSidebarCollapsed(true);
    useOnboardingStore.getState().completeOnboarding();
    
    // These would normally be persisted to localStorage
    // In a real app, you would reload the stores and check persistence
    expect(useLanguageStore.getState().language).toBe('fr');
    expect(useUIStore.getState().theme).toBe('dark');
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });
});