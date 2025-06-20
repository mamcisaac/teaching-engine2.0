import React from 'react';
import LanguageSensitiveAssessmentBuilder from './LanguageSensitiveAssessmentBuilder';
import { AssessmentTemplate } from '../../types';

interface AssessmentBuilderProps {
  template?: AssessmentTemplate;
  onSuccess?: (template: AssessmentTemplate) => void;
  onCancel?: () => void;
}

// This component now delegates to LanguageSensitiveAssessmentBuilder
// Keeping it for backward compatibility with existing imports
const AssessmentBuilder: React.FC<AssessmentBuilderProps> = (props) => {
  return <LanguageSensitiveAssessmentBuilder {...props} />;
};

export default AssessmentBuilder;
