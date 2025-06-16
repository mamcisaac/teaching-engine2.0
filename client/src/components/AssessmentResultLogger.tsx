import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCreateAssessmentResult } from '../api';
import { AssessmentTemplate, AssessmentResultInput } from '../types';
import { toast } from 'sonner';

interface AssessmentResultLoggerProps {
  template: AssessmentTemplate;
  defaultDate?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AssessmentResultLogger: React.FC<AssessmentResultLoggerProps> = ({
  template,
  defaultDate,
  onSuccess,
  onCancel,
}) => {
  const { language } = useLanguage();
  const createResultMutation = useCreateAssessmentResult();

  const [formData, setFormData] = useState<AssessmentResultInput>({
    templateId: template.id,
    date: defaultDate || new Date().toISOString().split('T')[0],
    groupScore: undefined,
    notes: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      templateId: template.id,
      date: defaultDate || prev.date,
    }));
  }, [template.id, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error(language === 'fr' ? 'La date est requise' : 'Date is required');
      return;
    }

    // Convert date to ISO format for API
    const isoDate = new Date(formData.date + 'T09:00:00').toISOString();

    try {
      await createResultMutation.mutateAsync({
        ...formData,
        date: isoDate,
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'oral':
        return '🗣️';
      case 'writing':
        return '✏️';
      case 'reading':
        return '📖';
      case 'mixed':
        return '📝';
      default:
        return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    if (language === 'fr') {
      switch (type) {
        case 'oral':
          return 'Oral';
        case 'writing':
          return 'Écriture';
        case 'reading':
          return 'Lecture';
        case 'mixed':
          return 'Mixte';
        default:
          return type;
      }
    } else {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'fr' ? 'Enregistrer le résultat' : 'Log Assessment Result'}
        </h2>

        {/* Template Info */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getTypeIcon(template.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{template.title}</h3>
              <p className="text-sm text-gray-600">
                {getTypeLabel(template.type)} {language === 'fr' ? 'Évaluation' : 'Assessment'}
              </p>
            </div>
          </div>
          {template.description && (
            <p className="text-sm text-gray-600 mt-2">{template.description}</p>
          )}
          {template.outcomeIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {template.outcomeIds.length}{' '}
              {language === 'fr' ? 'résultat(s) lié(s)' : 'linked outcome(s)'}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? "Date d'évaluation" : 'Assessment Date'} *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]} // Cannot be in the future
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Group Score */}
        <div>
          <label htmlFor="groupScore" className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Score du groupe (%)' : 'Group Score (%)'}
            <span className="text-gray-500 text-sm">
              {language === 'fr' ? ' (optionnel)' : ' (optional)'}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="groupScore"
              value={formData.groupScore ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  groupScore: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' ? 'Ex: 85' : 'e.g., 85'}
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {language === 'fr'
              ? 'Score moyen du groupe (0-100). Laissez vide si pas encore évalué.'
              : 'Average group score (0-100). Leave empty if not yet assessed.'}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Notes et observations' : 'Notes & Observations'}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              language === 'fr'
                ? 'Ajoutez des observations sur la performance du groupe, les défis rencontrés, les points forts...'
                : 'Add observations about group performance, challenges encountered, strengths...'
            }
          />
        </div>

        {/* Scoring Guidelines */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            {language === 'fr' ? 'Guide de notation' : 'Scoring Guidelines'}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• 90-100%: {language === 'fr' ? 'Excellent' : 'Excellent'}</div>
            <div>• 80-89%: {language === 'fr' ? 'Très bien' : 'Very Good'}</div>
            <div>• 70-79%: {language === 'fr' ? 'Bien' : 'Good'}</div>
            <div>• 60-69%: {language === 'fr' ? 'Acceptable' : 'Satisfactory'}</div>
            <div>
              • &lt;60%: {language === 'fr' ? "Besoin d'amélioration" : 'Needs Improvement'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={createResultMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createResultMutation.isPending
              ? language === 'fr'
                ? 'Enregistrement...'
                : 'Logging...'
              : language === 'fr'
                ? 'Enregistrer'
                : 'Log Result'}
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

export default AssessmentResultLogger;
