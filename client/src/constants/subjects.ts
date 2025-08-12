// Constants for subject selection and curriculum management

export const STORAGE_KEYS = {
  TEACHER_SUBJECTS: 'teacher-subjects',
  ONBOARDED: 'onboarded',
  IS_AUTHENTICATED: 'isAuthenticated',
} as const;

export const CORE_SUBJECTS = [
  'Français (Immersion)',
  'Mathématiques',
] as const;

export const ALL_SUBJECTS = [
  'Français (Immersion)',
  'Mathématiques', 
  'Sciences de la nature',
  'Sciences humaines',
  'Arts visuels',
  'Musique',
  'Éducation physique',
  'Formation personnelle et sociale',
] as const;

export const SPECIALIST_SUBJECTS = [
  'Éducation physique',
  'Musique',
] as const;

export type Subject = typeof ALL_SUBJECTS[number];
export type CoreSubject = typeof CORE_SUBJECTS[number];
export type SpecialistSubject = typeof SPECIALIST_SUBJECTS[number];