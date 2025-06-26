import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  getLocalizedField: (obj: Record<string, unknown>, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

// Comprehensive translation system for Teaching Engine 2.0
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    settings: 'Settings',
    planning: 'Planning',
    curriculum: 'Curriculum',
    students: 'Students',
    resources: 'Resources',
    help: 'Help',
    
    // Planning Levels
    long_range_plan: 'Long-Range Plan',
    long_range_plans: 'Long-Range Plans',
    unit_plan: 'Unit Plan',
    unit_plans: 'Unit Plans',
    lesson_plan: 'Lesson Plan',
    lesson_plans: 'Lesson Plans',
    daily_plan: 'Daily Plan',
    daybook: 'Daybook',
    daybook_entry: 'Daybook Entry',
    
    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    share: 'Share',
    duplicate: 'Duplicate',
    archive: 'Archive',
    
    // Form Fields
    title: 'Title',
    description: 'Description',
    date: 'Date',
    start_date: 'Start Date',
    end_date: 'End Date',
    duration: 'Duration',
    grade: 'Grade',
    subject: 'Subject',
    language: 'Language',
    notes: 'Notes',
    
    // Unit Plan Fields
    big_ideas: 'Big Ideas',
    essential_questions: 'Essential Questions',
    learning_goals: 'Learning Goals',
    success_criteria: 'Success Criteria',
    assessment_plan: 'Assessment Plan',
    culminating_task: 'Culminating Task',
    key_vocabulary: 'Key Vocabulary',
    prior_knowledge: 'Prior Knowledge',
    cross_curricular: 'Cross-Curricular Connections',
    learning_skills: 'Learning Skills',
    differentiation: 'Differentiation Strategies',
    differentiation_struggling: 'For Struggling Students',
    differentiation_advanced: 'For Advanced Students',
    differentiation_ell: 'For English Language Learners',
    differentiation_iep: 'For Students with IEPs',
    indigenous_perspectives: 'Indigenous Perspectives',
    environmental_education: 'Environmental Education',
    social_justice: 'Social Justice Connections',
    technology_integration: 'Technology Integration',
    community_connections: 'Community Connections',
    parent_communication: 'Parent Communication Plan',
    field_trips: 'Field Trips & Guest Speakers',
    
    // Lesson Plan Fields
    minds_on: 'Minds On',
    action: 'Action',
    consolidation: 'Consolidation',
    materials: 'Materials',
    grouping: 'Grouping',
    accommodations: 'Accommodations',
    modifications: 'Modifications',
    extensions: 'Extensions',
    assessment_type: 'Assessment Type',
    assessment_notes: 'Assessment Notes',
    sub_friendly: 'Substitute Teacher Friendly',
    sub_notes: 'Substitute Teacher Notes',
    
    // Daybook Fields
    what_worked: 'What Worked Well?',
    what_didnt_work: 'What Could Be Improved?',
    next_steps: 'Next Steps',
    student_engagement: 'Student Engagement',
    student_challenges: 'Student Challenges',
    student_successes: 'Student Successes',
    overall_rating: 'Overall Rating',
    would_reuse: 'Would Reuse This Lesson',
    
    // Curriculum
    curriculum_expectations: 'Curriculum Expectations',
    expectation: 'Expectation',
    expectations: 'Expectations',
    strand: 'Strand',
    substrand: 'Substrand',
    code: 'Code',
    overall_expectation: 'Overall Expectation',
    specific_expectation: 'Specific Expectation',
    
    // Languages
    english: 'English',
    french: 'French',
    bilingual_content: 'Bilingual Content',
    show_both_languages: 'Show Both Languages',
    teaching_language: 'Teaching Language',
    french_immersion: 'French Immersion',
    core_french: 'Core French',
    
    // Time
    minutes: 'minutes',
    hours: 'hours',
    week: 'Week',
    month: 'Month',
    term: 'Term',
    year: 'Year',
    academic_year: 'Academic Year',
    
    // Messages
    loading: 'Loading...',
    saving: 'Saving...',
    saved: 'Saved successfully',
    error: 'An error occurred',
    no_data: 'No data available',
    required_field: 'This field is required',
    confirm_delete: 'Are you sure you want to delete this?',
    unsaved_changes: 'You have unsaved changes. Are you sure you want to leave?',
    
    // Planning specific
    add_expectation: 'Add Expectation',
    remove_expectation: 'Remove Expectation',
    select_expectations: 'Select Curriculum Expectations',
    coverage_summary: 'Coverage Summary',
    uncovered_expectations: 'Uncovered Expectations',
    ai_suggestions: 'AI Suggestions',
    generate_with_ai: 'Generate with AI',
    
    // Templates
    template: 'Template',
    templates: 'Templates',
    create_template: 'Create Template',
    edit_template: 'Edit Template',
    use_template: 'Use Template',
    template_library: 'Template Library',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    planning: 'Planification',
    curriculum: 'Programme',
    students: 'Élèves',
    resources: 'Ressources',
    help: 'Aide',
    
    // Planning Levels
    long_range_plan: 'Plan à long terme',
    long_range_plans: 'Plans à long terme',
    unit_plan: "Plan d'unité",
    unit_plans: "Plans d'unité",
    lesson_plan: 'Plan de leçon',
    lesson_plans: 'Plans de leçons',
    daily_plan: 'Plan quotidien',
    daybook: 'Journal de classe',
    daybook_entry: 'Entrée du journal',
    
    // Common Actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    submit: 'Soumettre',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    print: 'Imprimer',
    share: 'Partager',
    duplicate: 'Dupliquer',
    archive: 'Archiver',
    
    // Form Fields
    title: 'Titre',
    description: 'Description',
    date: 'Date',
    start_date: 'Date de début',
    end_date: 'Date de fin',
    duration: 'Durée',
    grade: 'Année',
    subject: 'Matière',
    language: 'Langue',
    notes: 'Notes',
    
    // Unit Plan Fields
    big_ideas: 'Grandes idées',
    essential_questions: 'Questions essentielles',
    learning_goals: "Objectifs d'apprentissage",
    success_criteria: 'Critères de réussite',
    assessment_plan: "Plan d'évaluation",
    culminating_task: 'Tâche culminante',
    key_vocabulary: 'Vocabulaire clé',
    prior_knowledge: 'Connaissances préalables',
    cross_curricular: 'Liens interdisciplinaires',
    learning_skills: "Habiletés d'apprentissage",
    differentiation: 'Stratégies de différenciation',
    differentiation_struggling: 'Pour les élèves en difficulté',
    differentiation_advanced: 'Pour les élèves avancés',
    differentiation_ell: 'Pour les apprenants de langue anglaise',
    differentiation_iep: 'Pour les élèves avec PEI',
    indigenous_perspectives: 'Perspectives autochtones',
    environmental_education: 'Éducation environnementale',
    social_justice: 'Liens avec la justice sociale',
    technology_integration: 'Intégration de la technologie',
    community_connections: 'Liens avec la communauté',
    parent_communication: 'Plan de communication avec les parents',
    field_trips: 'Sorties éducatives et conférenciers',
    
    // Lesson Plan Fields
    minds_on: 'Mise en situation',
    action: 'Action',
    consolidation: 'Consolidation',
    materials: 'Matériel',
    grouping: 'Regroupement',
    accommodations: 'Adaptations',
    modifications: 'Modifications',
    extensions: 'Enrichissement',
    assessment_type: "Type d'évaluation",
    assessment_notes: "Notes d'évaluation",
    sub_friendly: 'Adapté pour suppléant',
    sub_notes: 'Notes pour le suppléant',
    
    // Daybook Fields
    what_worked: "Qu'est-ce qui a bien fonctionné?",
    what_didnt_work: "Qu'est-ce qui pourrait être amélioré?",
    next_steps: 'Prochaines étapes',
    student_engagement: 'Engagement des élèves',
    student_challenges: 'Défis des élèves',
    student_successes: 'Réussites des élèves',
    overall_rating: 'Évaluation globale',
    would_reuse: 'Je réutiliserais cette leçon',
    
    // Curriculum
    curriculum_expectations: 'Attentes du programme',
    expectation: 'Attente',
    expectations: 'Attentes',
    strand: 'Domaine',
    substrand: 'Sous-domaine',
    code: 'Code',
    overall_expectation: 'Attente générale',
    specific_expectation: 'Attente spécifique',
    
    // Languages
    english: 'Anglais',
    french: 'Français',
    bilingual_content: 'Contenu bilingue',
    show_both_languages: 'Afficher les deux langues',
    teaching_language: "Langue d'enseignement",
    french_immersion: 'Immersion française',
    core_french: 'Français de base',
    
    // Time
    minutes: 'minutes',
    hours: 'heures',
    week: 'Semaine',
    month: 'Mois',
    term: 'Étape',
    year: 'Année',
    academic_year: 'Année scolaire',
    
    // Messages
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    saved: 'Enregistré avec succès',
    error: 'Une erreur est survenue',
    no_data: 'Aucune donnée disponible',
    required_field: 'Ce champ est obligatoire',
    confirm_delete: 'Êtes-vous sûr de vouloir supprimer ceci?',
    unsaved_changes: 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter?',
    
    // Planning specific
    add_expectation: 'Ajouter une attente',
    remove_expectation: 'Retirer une attente',
    select_expectations: 'Sélectionner les attentes du programme',
    coverage_summary: 'Résumé de la couverture',
    uncovered_expectations: 'Attentes non couvertes',
    ai_suggestions: 'Suggestions IA',
    generate_with_ai: 'Générer avec IA',
    
    // Templates
    template: 'Modèle',
    templates: 'Modèles',
    create_template: 'Créer un modèle',
    edit_template: 'Modifier le modèle',
    use_template: 'Utiliser le modèle',
    template_library: 'Bibliothèque de modèles',
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
