import { Outcome } from '@teaching-engine/database';

// Test curriculum data that's always available for tests
export const testCurriculumData = {
  frenchGrade1Outcomes: [
    {
      code: '1CO.1',
      description: 'Distinguer les sons dans la chaîne parlée',
      domain: 'Communication orale',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1CO.2',
      description: 'Suivre des consignes simples',
      domain: 'Communication orale',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1CO.3',
      description: 'Exprimer ses besoins et ses sentiments',
      domain: 'Communication orale',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1LE.1',
      description: 'Reconnaître les lettres de l\'alphabet',
      domain: 'Lecture',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1LE.2',
      description: 'Associer des sons aux lettres',
      domain: 'Lecture',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1EC.1',
      description: 'Tracer les lettres en respectant leur forme',
      domain: 'Écriture',
      subject: 'FRA',
      grade: 1,
    },
    {
      code: '1EC.2',
      description: 'Écrire des mots simples',
      domain: 'Écriture',
      subject: 'FRA',
      grade: 1,
    },
  ],
  mathGrade1Outcomes: [
    {
      code: '1N.1',
      description: 'Compter jusqu\'à 100',
      domain: 'Nombre',
      subject: 'MATH',
      grade: 1,
    },
    {
      code: '1N.2',
      description: 'Comparer et ordonner des nombres jusqu\'à 20',
      domain: 'Nombre',
      subject: 'MATH',
      grade: 1,
    },
    {
      code: '1G.1',
      description: 'Identifier et nommer des formes géométriques',
      domain: 'Géométrie',
      subject: 'MATH',
      grade: 1,
    },
  ],
  englishGrade2Outcomes: [
    {
      code: '2RL.1',
      description: 'Read simple texts with understanding',
      domain: 'Reading and Literature',
      subject: 'ENG',
      grade: 2,
    },
    {
      code: '2W.1',
      description: 'Write complete sentences with proper punctuation',
      domain: 'Writing',
      subject: 'ENG',
      grade: 2,
    },
  ],
};

// Function to get a full set of test outcomes (minimum 50 for Grade 1 French)
export function generateFullTestOutcomes(): Partial<Outcome>[] {
  const outcomes: Partial<Outcome>[] = [...testCurriculumData.frenchGrade1Outcomes];
  
  // Generate additional outcomes to meet the minimum requirement
  const domains = ['Communication orale', 'Lecture', 'Écriture', 'Culture'];
  let codeNumber = 10;
  
  while (outcomes.length < 55) {
    const domainIndex = Math.floor((codeNumber - 10) / 15) % domains.length;
    const domain = domains[domainIndex];
    const domainPrefix = domain === 'Écriture' ? 'EC' : domain.substring(0, 2).toUpperCase();
    
    outcomes.push({
      code: `1${domainPrefix}.${codeNumber}`,
      description: `Objectif d'apprentissage ${codeNumber} pour ${domain}`,
      domain: domain,
      subject: 'FRA',
      grade: 1,
    });
    
    codeNumber++;
  }
  
  return outcomes;
}

// Function to get all test outcomes across subjects
export function getAllTestOutcomes(): Partial<Outcome>[] {
  return [
    ...generateFullTestOutcomes(),
    ...testCurriculumData.mathGrade1Outcomes,
    ...testCurriculumData.englishGrade2Outcomes,
  ];
}

// Function to validate outcome data
export function validateOutcomeData(outcome: Partial<Outcome>): string[] {
  const errors: string[] = [];
  
  if (!outcome.code || outcome.code.trim() === '') {
    errors.push('Code is required');
  }
  
  if (!outcome.description || outcome.description.length < 5) {
    errors.push('Description must be at least 5 characters');
  }
  
  if (!outcome.domain || outcome.domain.trim() === '') {
    errors.push('Domain is required');
  }
  
  if (!outcome.subject || outcome.subject.trim() === '') {
    errors.push('Subject is required');
  }
  
  if (outcome.grade === undefined || outcome.grade < 1 || outcome.grade > 12) {
    errors.push('Grade must be between 1 and 12');
  }
  
  return errors;
}