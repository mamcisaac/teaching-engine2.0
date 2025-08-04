// Constants for subject selection and curriculum management

export const STORAGE_KEYS = {
  TEACHER_SUBJECTS: 'teacher-subjects',
  ONBOARDED: 'onboarded',
  IS_AUTHENTICATED: 'isAuthenticated',
} as const;

export const CORE_SUBJECTS = [
  'Français langue première',
  'Mathématiques',
] as const;

export const ALL_SUBJECTS = [
  'Français langue première',
  'Mathématiques', 
  'Sciences',
  'Études sociales',
  'English Language Arts',
  'Arts',
  'Éducation physique',
  'Éducation à la santé',
] as const;

export const SPECIALIST_SUBJECTS = [
  'Éducation physique',
  'Éducation à la santé',
] as const;

export type Subject = typeof ALL_SUBJECTS[number];
export type CoreSubject = typeof CORE_SUBJECTS[number];
export type SpecialistSubject = typeof SPECIALIST_SUBJECTS[number];