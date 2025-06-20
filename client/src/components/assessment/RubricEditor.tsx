import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

export interface RubricLevel {
  score: number;
  description: string;
}

export interface RubricCriterion {
  name: string;
  description: string;
  levels?: RubricLevel[];
}

interface RubricEditorProps {
  criteria: RubricCriterion[];
  onChange: (criteria: RubricCriterion[]) => void;
  readOnly?: boolean;
}

const RubricEditor: React.FC<RubricEditorProps> = ({ criteria, onChange, readOnly = false }) => {
  const { language } = useLanguage();

  const addCriterion = () => {
    onChange([
      ...criteria,
      {
        name: '',
        description: '',
        levels: [
          { score: 4, description: '' },
          { score: 3, description: '' },
          { score: 2, description: '' },
          { score: 1, description: '' },
        ],
      },
    ]);
  };

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateLevel = (criterionIndex: number, levelIndex: number, description: string) => {
    const updated = [...criteria];
    if (updated[criterionIndex].levels) {
      updated[criterionIndex].levels![levelIndex] = {
        ...updated[criterionIndex].levels![levelIndex],
        description,
      };
    }
    onChange(updated);
  };

  const removeCriterion = (index: number) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  const getScoreLabel = (score: number) => {
    const labels =
      language === 'fr'
        ? ['Débutant', 'En développement', 'Compétent', 'Excellent']
        : ['Beginning', 'Developing', 'Proficient', 'Excellent'];
    return labels[4 - score] || score.toString();
  };

  if (readOnly && criteria.length === 0) {
    return (
      <div className="text-gray-500 italic">
        {language === 'fr' ? 'Aucun critère défini' : 'No criteria defined'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {criteria.map((criterion, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 ${
            readOnly ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
          }`}
        >
          {readOnly ? (
            <>
              <h4 className="font-medium text-gray-900 mb-1">{criterion.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
              {criterion.levels && criterion.levels.length > 0 && (
                <div className="space-y-2">
                  {criterion.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="flex items-start space-x-3 text-sm">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <span className="font-medium text-gray-700">{level.score}</span>
                        <span className="text-xs text-gray-500">
                          ({getScoreLabel(level.score)})
                        </span>
                      </div>
                      <span className="text-gray-600 flex-1">{level.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`criterion-name-${index}`}>
                      {language === 'fr' ? 'Nom du critère' : 'Criterion name'}
                    </Label>
                    <Input
                      id={`criterion-name-${index}`}
                      value={criterion.name}
                      onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                      placeholder={language === 'fr' ? 'Ex: Prononciation' : 'Ex: Pronunciation'}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`criterion-desc-${index}`}>
                      {language === 'fr' ? 'Description' : 'Description'}
                    </Label>
                    <Textarea
                      id={`criterion-desc-${index}`}
                      value={criterion.description}
                      onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                      placeholder={
                        language === 'fr'
                          ? 'Décrivez ce qui est évalué...'
                          : 'Describe what is being assessed...'
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCriterion(index)}
                  className="ml-2"
                >
                  ×
                </Button>
              </div>

              {criterion.levels && (
                <div className="space-y-2 mt-4">
                  <Label className="text-xs font-medium text-gray-700">
                    {language === 'fr' ? 'Niveaux de performance' : 'Performance levels'}
                  </Label>
                  {criterion.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <span className="text-sm font-medium">{level.score}</span>
                        <span className="text-xs text-gray-500">
                          ({getScoreLabel(level.score)})
                        </span>
                      </div>
                      <Input
                        value={level.description}
                        onChange={(e) => updateLevel(index, levelIndex, e.target.value)}
                        placeholder={
                          language === 'fr'
                            ? `Description pour le niveau ${level.score}`
                            : `Description for level ${level.score}`
                        }
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button type="button" variant="outline" onClick={addCriterion} className="w-full">
          {language === 'fr' ? '+ Ajouter un critère' : '+ Add criterion'}
        </Button>
      )}
    </div>
  );
};

export default RubricEditor;
