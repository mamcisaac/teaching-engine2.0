import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Label } from '../ui/Label';

interface ScaleSelectorProps {
  value: 'numeric' | 'rubric' | 'checklist';
  onChange: (value: 'numeric' | 'rubric' | 'checklist') => void;
  disabled?: boolean;
}

const ScaleSelector: React.FC<ScaleSelectorProps> = ({ value, onChange, disabled = false }) => {
  const { language } = useLanguage();

  const scales = [
    {
      value: 'numeric' as const,
      label: language === 'fr' ? 'Numérique' : 'Numeric',
      description: language === 'fr' ? 'Score de 0 à 100%' : 'Score from 0 to 100%',
      icon: '%',
    },
    {
      value: 'rubric' as const,
      label: language === 'fr' ? 'Rubrique' : 'Rubric',
      description:
        language === 'fr'
          ? 'Critères avec niveaux de performance'
          : 'Criteria with performance levels',
      icon: '📊',
    },
    {
      value: 'checklist' as const,
      label: language === 'fr' ? 'Liste de vérification' : 'Checklist',
      description: language === 'fr' ? 'Compétences à cocher' : 'Skills to check off',
      icon: '✓',
    },
  ];

  return (
    <div>
      <Label className="mb-3">
        {language === 'fr' ? "Type d'échelle d'évaluation" : 'Assessment Scale Type'}
      </Label>
      <div className="grid grid-cols-3 gap-3">
        {scales.map((scale) => (
          <button
            key={scale.value}
            type="button"
            onClick={() => !disabled && onChange(scale.value)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${
                value === scale.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-2xl mb-2 text-center">{scale.icon}</div>
            <div className="font-medium text-sm">{scale.label}</div>
            <div className="text-xs text-gray-600 mt-1">{scale.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScaleSelector;
