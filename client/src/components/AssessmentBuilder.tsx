import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useOutcomes } from '../api';
import { useCreateAssessmentTemplate, useUpdateAssessmentTemplate } from '../api';
import { AssessmentTemplate, AssessmentInput } from '../types';
import { toast } from 'sonner';

interface AssessmentBuilderProps {
  template?: AssessmentTemplate;
  onSuccess?: (template: AssessmentTemplate) => void;
  onCancel?: () => void;
}

const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({ template, onSuccess, onCancel }) => {
  const { language } = useLanguage();
  const { data: outcomes = [] } = useOutcomes();
  const createMutation = useCreateAssessmentTemplate();
  const updateMutation = useUpdateAssessmentTemplate();

  const [formData, setFormData] = useState<AssessmentInput>({
    title: '',
    type: 'oral',
    description: '',
    outcomeIds: [],
  });

  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        type: template.type,
        description: template.description || '',
        outcomeIds: template.outcomeIds,
      });
      setSelectedOutcomes(template.outcomeIds);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(language === 'fr' ? 'Le titre est requis' : 'Title is required');
      return;
    }

    const assessmentData = {
      ...formData,
      outcomeIds: selectedOutcomes,
    };

    try {
      if (template) {
        const updatedTemplate = await updateMutation.mutateAsync({
          id: template.id,
          data: assessmentData,
        });
        onSuccess?.(updatedTemplate);
      } else {
        const newTemplate = await createMutation.mutateAsync(assessmentData);
        onSuccess?.(newTemplate);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOutcomeToggle = (outcomeId: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcomeId) ? prev.filter((id) => id !== outcomeId) : [...prev, outcomeId],
    );
  };

  const getDefaultCriteria = (type: AssessmentTemplate['type']) => {
    switch (type) {
      case 'oral':
        return language === 'fr'
          ? 'Prononciation, fluidité, écoute'
          : 'Pronunciation, fluency, listening';
      case 'writing':
        return language === 'fr'
          ? 'Vocabulaire, orthographe, structure des phrases'
          : 'Vocabulary, spelling, sentence structure';
      case 'reading':
        return language === 'fr'
          ? 'Compréhension, fluidité, précision'
          : 'Comprehension, fluency, accuracy';
      case 'mixed':
        return language === 'fr'
          ? 'Critères multiples selon les activités'
          : 'Multiple criteria based on activities';
      default:
        return '';
    }
  };

  const assessmentTypes = [
    { value: 'oral', label: language === 'fr' ? 'Oral' : 'Oral' },
    { value: 'reading', label: language === 'fr' ? 'Lecture' : 'Reading' },
    { value: 'writing', label: language === 'fr' ? 'Écriture' : 'Writing' },
    { value: 'mixed', label: language === 'fr' ? 'Mixte' : 'Mixed' },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {template
          ? language === 'fr'
            ? "Modifier le modèle d'évaluation"
            : 'Edit Assessment Template'
          : language === 'fr'
            ? "Créer un modèle d'évaluation"
            : 'Create Assessment Template'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Titre' : 'Title'} *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              language === 'fr'
                ? 'Ex: Entrevue orale - Vocabulaire familial'
                : 'Ex: Oral Interview - Family Vocabulary'
            }
            required
          />
        </div>

        {/* Assessment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {language === 'fr' ? "Type d'évaluation" : 'Assessment Type'} *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {assessmentTypes.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as AssessmentTemplate['type'] })
                  }
                  className="sr-only"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description' : 'Description'}
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              language === 'fr'
                ? "Décrivez l'évaluation et ses objectifs..."
                : 'Describe the assessment and its objectives...'
            }
          />
          {formData.type && (
            <p className="mt-1 text-sm text-gray-500">
              {language === 'fr' ? 'Critères suggérés: ' : 'Suggested criteria: '}
              {getDefaultCriteria(formData.type)}
            </p>
          )}
        </div>

        {/* Linked Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {language === 'fr' ? "Résultats d'apprentissage liés" : 'Linked Learning Outcomes'}
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
            {outcomes.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {language === 'fr'
                  ? "Aucun résultat d'apprentissage disponible"
                  : 'No learning outcomes available'}
              </p>
            ) : (
              outcomes.map((outcome) => (
                <label
                  key={outcome.id}
                  className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedOutcomes.includes(outcome.id)}
                    onChange={() => handleOutcomeToggle(outcome.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{outcome.code}</div>
                    <div className="text-sm text-gray-500 line-clamp-2">{outcome.description}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          {selectedOutcomes.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedOutcomes.length}{' '}
              {language === 'fr' ? 'résultat(s) sélectionné(s)' : 'outcome(s) selected'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending || updateMutation.isPending
              ? language === 'fr'
                ? 'Sauvegarde...'
                : 'Saving...'
              : template
                ? language === 'fr'
                  ? 'Mettre à jour'
                  : 'Update'
                : language === 'fr'
                  ? 'Créer'
                  : 'Create'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AssessmentBuilder;
