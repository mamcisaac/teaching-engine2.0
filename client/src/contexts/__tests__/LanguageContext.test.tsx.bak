/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file LanguageContext.test.tsx
 * @description Comprehensive tests for LanguageContext including language switching,
 * localStorage persistence, translation functions, and localization utilities.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider initialization', () => {
    it('should provide language context', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('getLocalizedField');
    });

    it('should initialize with English as default', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.language).toBe('en');
    });

    it('should load saved language preference from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.language).toBe('fr');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('preferredLanguage');
    });

    it('should ignore invalid language preferences', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-lang');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.language).toBe('en');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.language).toBe('en');
    });
  });

  describe('Language switching', () => {
    it('should switch to French', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setLanguage('fr');
      });

      expect(result.current.language).toBe('fr');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'fr');
    });

    it('should switch back to English', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.language).toBe('fr');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'en');
    });

    it('should handle invalid language codes', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setLanguage('invalid');
      });

      expect(result.current.language).toBe('invalid');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'invalid');
    });
  });

  describe('Translation function (t)', () => {
    it('should return English translation for valid key', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('dashboard')).toBe('Dashboard');
      expect(result.current.t('save')).toBe('Save');
      expect(result.current.t('cancel')).toBe('Cancel');
    });

    it('should return French translation when language is French', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('dashboard')).toBe('Tableau de bord');
      expect(result.current.t('save')).toBe('Enregistrer');
      expect(result.current.t('cancel')).toBe('Annuler');
    });

    it('should return fallback for missing keys', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('non_existent_key', 'Fallback Text')).toBe('Fallback Text');
    });

    it('should return key itself when no fallback provided', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('non_existent_key')).toBe('non_existent_key');
    });

    it('should handle string interpolation with substitutions', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('step_x_of_y', undefined, ['3', '5'])).toBe('Step 3 of 5');
      expect(result.current.t('percent_complete', undefined, ['75'])).toBe('75% complete');
    });

    it('should handle multiple substitutions', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const result1 = result.current.t('step_x_of_y', undefined, ['1', '10']);
      const result2 = result.current.t('step_x_of_y', undefined, ['5', '10']);

      expect(result1).toBe('Step 1 of 10');
      expect(result2).toBe('Step 5 of 10');
    });

    it('should handle French interpolation', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('step_x_of_y', undefined, ['2', '4'])).toBe('Étape 2 de 4');
      expect(result.current.t('percent_complete', undefined, ['50'])).toBe('50% terminé');
    });

    it('should handle empty or null substitutions', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.t('dashboard', undefined, [])).toBe('Dashboard');
      expect(result.current.t('dashboard', undefined, undefined)).toBe('Dashboard');
    });
  });

  describe('Localized field function (getLocalizedField)', () => {
    it('should return localized field for English', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const obj = {
        title: 'English Title',
        titleEn: 'English Title Specific',
        titleFr: 'Titre Français',
      };

      expect(result.current.getLocalizedField(obj, 'title')).toBe('English Title Specific');
    });

    it('should return localized field for French', () => {
      mockLocalStorage.getItem.mockReturnValue('fr');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const obj = {
        title: 'English Title',
        titleEn: 'English Title Specific',
        titleFr: 'Titre Français',
      };

      expect(result.current.getLocalizedField(obj, 'title')).toBe('Titre Français');
    });

    it('should fall back to base field when localized version missing', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const obj = {
        title: 'Base Title',
        description: 'Base Description',
      };

      expect(result.current.getLocalizedField(obj, 'title')).toBe('Base Title');
      expect(result.current.getLocalizedField(obj, 'description')).toBe('Base Description');
    });

    it('should handle empty objects', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getLocalizedField({}, 'title')).toBe('');
    });

    it('should handle null/undefined objects', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getLocalizedField(null as unknown as Record<string, unknown>, 'title')).toBe('');
      expect(result.current.getLocalizedField(undefined as unknown as Record<string, unknown>, 'title')).toBe('');
    });

    it('should handle missing field', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const obj = { otherField: 'value' };

      expect(result.current.getLocalizedField(obj, 'title')).toBe('');
    });

    it('should convert non-string values to strings', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const obj = {
        count: 42,
        countEn: 100,
        isActive: true,
        isActiveEn: false,
      };

      expect(result.current.getLocalizedField(obj, 'count')).toBe('100');
      expect(result.current.getLocalizedField(obj, 'isActive')).toBe('false');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle localStorage setItem errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.setLanguage('fr');
        });
      }).not.toThrow();

      expect(result.current.language).toBe('fr');
    });

    it('should maintain referential stability of functions', () => {
      const { result, rerender } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const tRef = result.current.t;
      const setLanguageRef = result.current.setLanguage;
      const getLocalizedFieldRef = result.current.getLocalizedField;

      rerender();

      // Functions should be stable across re-renders
      expect(result.current.t).toBe(tRef);
      expect(result.current.setLanguage).toBe(setLanguageRef);
      expect(result.current.getLocalizedField).toBe(getLocalizedFieldRef);
    });

    it('should handle rapid language switching', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setLanguage('fr');
        result.current.setLanguage('en');
        result.current.setLanguage('fr');
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(4);
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should support ETFO bilingual workflows', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      // English planning
      expect(result.current.t('unit_plan')).toBe('Unit Plan');
      expect(result.current.t('lesson_plan')).toBe('Lesson Plan');
      expect(result.current.t('big_ideas')).toBe('Big Ideas');

      // Switch to French
      act(() => {
        result.current.setLanguage('fr');
      });

      // French planning
      expect(result.current.t('unit_plan')).toBe("Plan d'unité");
      expect(result.current.t('lesson_plan')).toBe('Plan de leçon');
      expect(result.current.t('big_ideas')).toBe('Grandes idées');
    });

    it('should handle bilingual content objects', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      const bilingualLesson = {
        title: 'Math Lesson',
        titleEn: 'Introduction to Fractions',
        titleFr: 'Introduction aux fractions',
        description: 'Basic description',
        descriptionEn: 'Students will learn basic fraction concepts',
        descriptionFr: 'Les élèves apprendront les concepts de base des fractions',
      };

      // English context
      expect(result.current.getLocalizedField(bilingualLesson, 'title')).toBe(
        'Introduction to Fractions',
      );
      expect(result.current.getLocalizedField(bilingualLesson, 'description')).toBe(
        'Students will learn basic fraction concepts',
      );

      // Switch to French
      act(() => {
        result.current.setLanguage('fr');
      });

      // French context
      expect(result.current.getLocalizedField(bilingualLesson, 'title')).toBe(
        'Introduction aux fractions',
      );
      expect(result.current.getLocalizedField(bilingualLesson, 'description')).toBe(
        'Les élèves apprendront les concepts de base des fractions',
      );
    });

    it('should support onboarding flow translations', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(),
      });

      // English onboarding
      expect(result.current.t('welcome_title')).toBe('Welcome to Teaching Engine 2.0');
      expect(result.current.t('get_started')).toBe('Get Started');
      expect(result.current.t('skip_tour')).toBe('Skip Tour');

      // French onboarding
      act(() => {
        result.current.setLanguage('fr');
      });

      expect(result.current.t('welcome_title')).toBe('Bienvenue dans Teaching Engine 2.0');
      expect(result.current.t('get_started')).toBe('Commencer');
      expect(result.current.t('skip_tour')).toBe('Ignorer la visite');
    });
  });

  describe('Hook error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow('useLanguage must be used within a LanguageProvider');
    });
  });
});
