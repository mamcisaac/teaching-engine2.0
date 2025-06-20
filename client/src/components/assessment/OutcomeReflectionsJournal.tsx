import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  useOutcomes,
  useTeacherReflections,
  useCreateTeacherReflection,
  useUpdateTeacherReflection,
  useDeleteTeacherReflection,
} from '../../api';
import { Outcome } from '../../types';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import OutcomeTag from '../OutcomeTag';

interface OutcomeReflectionsJournalProps {
  selectedOutcomeId?: string;
  onOutcomeSelect?: (outcomeId: string) => void;
}

const OutcomeReflectionsJournal: React.FC<OutcomeReflectionsJournalProps> = ({
  selectedOutcomeId,
  onOutcomeSelect,
}) => {
  const { language } = useLanguage();
  const { data: outcomes = [] } = useOutcomes();
  const { data: reflections = [] } = useTeacherReflections();
  const createMutation = useCreateTeacherReflection();
  const updateMutation = useUpdateTeacherReflection();
  const deleteMutation = useDeleteTeacherReflection();

  const [activeOutcomeId, setActiveOutcomeId] = useState<string | null>(selectedOutcomeId || null);
  const [reflectionText, setReflectionText] = useState('');
  const [editingReflectionId, setEditingReflectionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBySubject, setFilterBySubject] = useState<string>('all');

  // Group outcomes by subject
  const outcomesBySubject = useMemo(() => {
    return outcomes.reduce(
      (acc, outcome) => {
        if (!acc[outcome.subject]) {
          acc[outcome.subject] = [];
        }
        acc[outcome.subject].push(outcome);
        return acc;
      },
      {} as Record<string, Outcome[]>,
    );
  }, [outcomes]);

  // Get reflections for the active outcome
  const activeOutcomeReflections = useMemo(() => {
    if (!activeOutcomeId) return [];
    return reflections.filter((r) => r.outcomeId === activeOutcomeId);
  }, [reflections, activeOutcomeId]);

  // Filter outcomes based on search and subject filter
  const filteredOutcomes = useMemo(() => {
    let filtered = outcomes;

    if (filterBySubject !== 'all') {
      filtered = filtered.filter((o) => o.subject === filterBySubject);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) => o.code.toLowerCase().includes(term) || o.description.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [outcomes, filterBySubject, searchTerm]);

  // Get outcomes with reflections (for future use)
  // const outcomesWithReflections = useMemo(() => {
  //   const outcomeIds = new Set(reflections.map(r => r.outcomeId));
  //   return outcomes.filter(o => outcomeIds.has(o.id));
  // }, [outcomes, reflections]);

  const handleOutcomeSelect = (outcomeId: string) => {
    setActiveOutcomeId(outcomeId);
    setReflectionText('');
    setEditingReflectionId(null);
    onOutcomeSelect?.(outcomeId);
  };

  const handleSaveReflection = async () => {
    if (!activeOutcomeId || !reflectionText.trim()) {
      toast.error(
        language === 'fr'
          ? 'Veuillez sélectionner un résultat et écrire une réflexion'
          : 'Please select an outcome and write a reflection',
      );
      return;
    }

    try {
      if (editingReflectionId) {
        await updateMutation.mutateAsync({
          id: editingReflectionId,
          content: reflectionText.trim(),
        });
        toast.success(language === 'fr' ? 'Réflexion mise à jour' : 'Reflection updated');
      } else {
        await createMutation.mutateAsync({
          outcomeId: activeOutcomeId,
          content: reflectionText.trim(),
        });
        toast.success(language === 'fr' ? 'Réflexion ajoutée' : 'Reflection added');
      }

      setReflectionText('');
      setEditingReflectionId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditReflection = (reflection: { id: number; content: string }) => {
    setReflectionText(reflection.content);
    setEditingReflectionId(reflection.id);
  };

  const handleDeleteReflection = async (id: number) => {
    if (!confirm(language === 'fr' ? 'Supprimer cette réflexion?' : 'Delete this reflection?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(language === 'fr' ? 'Réflexion supprimée' : 'Reflection deleted');

      if (editingReflectionId === id) {
        setReflectionText('');
        setEditingReflectionId(null);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const activeOutcome = outcomes.find((o) => o.id === activeOutcomeId);

  return (
    <div className="h-full flex">
      {/* Left Panel - Outcome Selection */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-3">
            {language === 'fr' ? "Résultats d'apprentissage" : 'Learning Outcomes'}
          </h3>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
          />

          {/* Subject Filter */}
          <select
            value={filterBySubject}
            onChange={(e) => setFilterBySubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
          >
            <option value="all">
              {language === 'fr' ? 'Toutes les matières' : 'All subjects'}
            </option>
            {Object.keys(outcomesBySubject).map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              {language === 'fr' ? 'Tous' : 'All'}
            </button>
            <button
              onClick={() => {
                const withReflectionIds = new Set(reflections.map((r) => r.outcomeId));
                const firstWithReflection = filteredOutcomes.find((o) =>
                  withReflectionIds.has(o.id),
                );
                if (firstWithReflection) {
                  handleOutcomeSelect(firstWithReflection.id);
                }
              }}
              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              {language === 'fr' ? 'Avec réflexions' : 'With reflections'}
            </button>
            <button
              onClick={() => {
                const withReflectionIds = new Set(reflections.map((r) => r.outcomeId));
                const firstWithoutReflection = filteredOutcomes.find(
                  (o) => !withReflectionIds.has(o.id),
                );
                if (firstWithoutReflection) {
                  handleOutcomeSelect(firstWithoutReflection.id);
                }
              }}
              className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
            >
              {language === 'fr' ? 'Sans réflexions' : 'Without reflections'}
            </button>
          </div>
        </div>

        {/* Outcome List */}
        <div className="divide-y divide-gray-100">
          {filteredOutcomes.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">
              {language === 'fr' ? 'Aucun résultat trouvé' : 'No outcomes found'}
            </p>
          ) : (
            filteredOutcomes.map((outcome) => {
              const reflectionCount = reflections.filter((r) => r.outcomeId === outcome.id).length;
              const isActive = outcome.id === activeOutcomeId;

              return (
                <button
                  key={outcome.id}
                  onClick={() => handleOutcomeSelect(outcome.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{outcome.code}</span>
                        {outcome.domain && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {outcome.domain}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {outcome.description}
                      </p>
                    </div>
                    {reflectionCount > 0 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {reflectionCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Reflection Journal */}
      <div className="flex-1 flex flex-col">
        {activeOutcome ? (
          <>
            {/* Outcome Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div>
                    <OutcomeTag outcome={activeOutcome} />
                    <p className="text-sm text-gray-600 mt-1">{activeOutcome.description}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {activeOutcomeReflections.length}{' '}
                    {language === 'fr'
                      ? `réflexion${activeOutcomeReflections.length !== 1 ? 's' : ''}`
                      : `reflection${activeOutcomeReflections.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Reflection Entry */}
            <div className="p-4 border-b border-gray-200">
              <Label htmlFor="reflection-text">
                {editingReflectionId
                  ? language === 'fr'
                    ? 'Modifier la réflexion'
                    : 'Edit reflection'
                  : language === 'fr'
                    ? 'Nouvelle réflexion'
                    : 'New reflection'}
              </Label>
              <Textarea
                id="reflection-text"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                placeholder={
                  language === 'fr'
                    ? "Écrivez vos observations sur ce résultat d'apprentissage..."
                    : 'Write your observations about this learning outcome...'
                }
                className="mt-2"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleSaveReflection}
                  disabled={
                    !reflectionText.trim() || createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? language === 'fr'
                      ? 'Sauvegarde...'
                      : 'Saving...'
                    : editingReflectionId
                      ? language === 'fr'
                        ? 'Mettre à jour'
                        : 'Update'
                      : language === 'fr'
                        ? 'Ajouter'
                        : 'Add'}
                </Button>
                {editingReflectionId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReflectionText('');
                      setEditingReflectionId(null);
                    }}
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>

            {/* Previous Reflections */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeOutcomeReflections.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-2">
                    {language === 'fr'
                      ? "Aucune réflexion pour ce résultat d'apprentissage"
                      : 'No reflections for this learning outcome'}
                  </p>
                  <p className="text-sm">
                    {language === 'fr'
                      ? 'Ajoutez votre première réflexion ci-dessus'
                      : 'Add your first reflection above'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOutcomeReflections
                    .sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    )
                    .map((reflection) => (
                      <div
                        key={reflection.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <time className="text-sm text-gray-500">
                            {formatDate(reflection.createdAt)}
                          </time>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReflection(reflection)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {language === 'fr' ? 'Modifier' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleDeleteReflection(reflection.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              {language === 'fr' ? 'Supprimer' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{reflection.content}</p>
                        {reflection.updatedAt !== reflection.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {language === 'fr' ? 'Modifié le' : 'Updated'}{' '}
                            {formatDate(reflection.updatedAt)}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-2">
                {language === 'fr'
                  ? "Sélectionnez un résultat d'apprentissage"
                  : 'Select a learning outcome'}
              </p>
              <p className="text-sm">
                {language === 'fr'
                  ? 'pour voir et ajouter des réflexions'
                  : 'to view and add reflections'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutcomeReflectionsJournal;
