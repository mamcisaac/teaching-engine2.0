
import { MapPin, Book, Target, FileText, CheckCircle } from 'lucide-react';
import React from 'react';

import type { PEICurriculumAlignment, PEILearningOutcome } from '../../types/frenchImmersion';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';

interface PEICurriculumConnectorProps {
  grade: number;
  subject: string;
  onOutcomeSelect?: (outcome: PEILearningOutcome) => void;
  selectedOutcomes?: PEILearningOutcome[];
}

// PEI Grade 1 French Immersion Curriculum Outcomes
const PEI_GRADE1_OUTCOMES: Record<string, PEICurriculumAlignment> = {
  'French Language Arts': {
    grade: 1,
    subject: 'French Language Arts',
    strand: 'Oral Communication',
    outcomes: [
      {
        code: 'FLA-OC-1.1',
        descriptionEn: 'Listen and respond to simple oral French texts',
        descriptionFr: 'Écouter et répondre à des textes oraux simples en français',
        indicators: [
          'Follows simple classroom instructions in French',
          'Responds to basic questions with gestures or single words',
          'Demonstrates understanding through actions',
        ],
        frenchLanguageSupport: [
          'Use visual aids and gestures',
          'Repeat key vocabulary',
          'Provide wait time for processing',
        ],
      },
      {
        code: 'FLA-OC-1.2',
        descriptionEn: 'Communicate basic needs and ideas in French',
