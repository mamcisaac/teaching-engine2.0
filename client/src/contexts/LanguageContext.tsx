import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  getLocalizedField: (obj: Record<string, unknown>, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

// Simple translation function - in a real app, you'd load these from files
const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    settings: 'Settings',
    daily_plan: 'Daily Plan',
    unit_planner: 'Unit Planner',
    oral_routines: 'Oral Routines',
    general: 'General',
    create_template: 'Create Template',
    edit_template: 'Edit Template',
    title: 'Title',
    description: 'Description',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    english: 'English',
    french: 'French',
    language: 'Language',
    bilingual_content: 'Bilingual Content',
    show_both_languages: 'Show Both Languages',
  },
  fr: {
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    daily_plan: 'Plan quotidien',
    unit_planner: "Planificateur d'unité",
    oral_routines: 'Routines orales',
    general: 'Général',
    create_template: 'Créer un modèle',
    edit_template: 'Modifier le modèle',
    title: 'Titre',
    description: 'Description',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    english: 'Anglais',
    french: 'Français',
    language: 'Langue',
    bilingual_content: 'Contenu bilingue',
    show_both_languages: 'Afficher les deux langues',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>('en');

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    // TODO: Update user preference in backend
  };

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key];
    return translation || fallback || key;
  };

  // Helper function to get localized field from an object
  const getLocalizedField = (obj: Record<string, unknown>, field: string): string => {
    if (!obj) return '';

    const localizedFieldName = `${field}${language.charAt(0).toUpperCase() + language.slice(1)}`;
    const localizedValue = obj[localizedFieldName];

    // Return localized version if it exists, otherwise fall back to base field
    return String(localizedValue || obj[field] || '');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getLocalizedField,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
