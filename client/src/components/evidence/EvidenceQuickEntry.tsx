import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutcomes, useStudents, useCreateStudentReflection } from '../../api';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import OutcomeTag from '../OutcomeTag';

interface EvidenceQuickEntryProps {
  onSuccess?: () => void;
}

// interface EvidenceEntry {
//   studentId: number;
//   outcomeId: string;
//   content: string;
//   voiceNote?: string;
//   emoji?: string;
// }

const EvidenceQuickEntry: React.FC<EvidenceQuickEntryProps> = ({ onSuccess }) => {
  const { language } = useLanguage();
  const { data: outcomes = [] } = useOutcomes();
  const { data: students = [] } = useStudents();
  const createReflectionMutation = useCreateStudentReflection();

  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [evidenceText, setEvidenceText] = useState('');
  const [quickMode, setQuickMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [showOutcomeSearch, setShowOutcomeSearch] = useState(false);
  const [outcomeSearchTerm, setOutcomeSearchTerm] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Group outcomes by subject for easier selection (for future use)
  // const outcomesBySubject = outcomes.reduce((acc, outcome) => {
  //   if (!acc[outcome.subject]) {
  //     acc[outcome.subject] = [];
  //   }
  //   acc[outcome.subject].push(outcome);
  //   return acc;
  // }, {} as Record<string, Outcome[]>);

  // Filter outcomes based on search
  const filteredOutcomes = outcomes.filter(
    (outcome) =>
      outcome.code.toLowerCase().includes(outcomeSearchTerm.toLowerCase()) ||
      outcome.description.toLowerCase().includes(outcomeSearchTerm.toLowerCase()),
  );

  const emojis = ['😊', '🙂', '😐', '😕', '😟', '🤔', '🙌', '👍', '✨', '🎯', '📝', '🗣️'];

  const quickSuggestions = [
    {
      fr: "Excellent travail aujourd'hui!",
      en: 'Excellent work today!',
      emoji: '🌟',
    },
    {
      fr: 'Bon effort, continue comme ça!',
      en: 'Good effort, keep it up!',
      emoji: '👍',
    },
    {
      fr: 'A besoin de plus de pratique',
      en: 'Needs more practice',
      emoji: '🤔',
    },
    {
      fr: 'Participation active en classe',
      en: 'Active participation in class',
      emoji: '🙌',
    },
    {
      fr: 'A aidé un camarade',
      en: 'Helped a classmate',
      emoji: '🤝',
    },
  ];

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleOutcomeToggle = (outcomeId: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcomeId) ? prev.filter((id) => id !== outcomeId) : [...prev, outcomeId],
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const handleQuickSuggestion = (suggestion: (typeof quickSuggestions)[0]) => {
    setEvidenceText(language === 'fr' ? suggestion.fr : suggestion.en);
    setSelectedEmoji(suggestion.emoji);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // TODO: Convert to base64 or upload to server
        // For now, we'll just add a note that voice was recorded
        setEvidenceText(
          (prev) =>
            prev +
            (prev ? '\n' : '') +
            (language === 'fr' ? '[Note vocale enregistrée]' : '[Voice note recorded]'),
        );
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error(
        language === 'fr' ? "Impossible d'accéder au microphone" : 'Unable to access microphone',
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error(
        language === 'fr'
          ? 'Veuillez sélectionner au moins un élève'
          : 'Please select at least one student',
      );
      return;
    }

    if (!evidenceText.trim() && !selectedEmoji) {
      toast.error(
        language === 'fr'
          ? 'Veuillez ajouter du texte ou sélectionner un emoji'
          : 'Please add text or select an emoji',
      );
      return;
    }

    try {
      // Create evidence entries for each selected student
      const promises = selectedStudents.map((studentId) => {
        const data = {
          content: evidenceText.trim(),
          emoji: selectedEmoji || undefined,
          date: new Date().toISOString(),
          outcomeId: selectedOutcomes[0] || undefined, // Use first selected outcome
        };

        return createReflectionMutation.mutateAsync({ studentId, data });
      });

      await Promise.all(promises);

      toast.success(
        language === 'fr'
          ? `Évidence enregistrée pour ${selectedStudents.length} élève(s)`
          : `Evidence recorded for ${selectedStudents.length} student(s)`,
      );

      // Reset form
      setSelectedStudents([]);
      setSelectedOutcomes([]);
      setEvidenceText('');
      setSelectedEmoji('');
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const selectedStudentNames = selectedStudents
    .map((id) => students.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => `${s!.firstName} ${s!.lastName}`)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'fr' ? "Saisie rapide d'évidence" : 'Quick Evidence Entry'}
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quickMode}
              onChange={(e) => setQuickMode(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">{language === 'fr' ? 'Mode rapide' : 'Quick mode'}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">
              {language === 'fr' ? 'Sélectionner les élèves' : 'Select Students'}
            </Label>
            <Button variant="outline" size="sm" onClick={handleSelectAllStudents}>
              {selectedStudents.length === students.length
                ? language === 'fr'
                  ? 'Désélectionner tout'
                  : 'Deselect all'
                : language === 'fr'
                  ? 'Sélectionner tout'
                  : 'Select all'}
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 gap-2">
              {students.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                    selectedStudents.includes(student.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium">
                    {student.firstName} {student.lastName}
                  </span>
                  <span className="ml-auto text-sm text-gray-500">
                    {language === 'fr' ? 'Année' : 'Grade'} {student.grade}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="text-sm text-gray-600">
              {language === 'fr' ? 'Sélectionnés:' : 'Selected:'} {selectedStudentNames}
            </div>
          )}
        </div>

        {/* Evidence Entry */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">
            {language === 'fr' ? 'Évidence observée' : 'Observed Evidence'}
          </Label>

          {/* Quick Suggestions */}
          {quickMode && (
            <div className="space-y-2">
              <Label className="text-sm">
                {language === 'fr' ? 'Suggestions rapides:' : 'Quick suggestions:'}
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-left p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-2">{suggestion.emoji}</span>
                    {language === 'fr' ? suggestion.fr : suggestion.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Entry */}
          <div>
            <Textarea
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              rows={4}
              placeholder={
                language === 'fr'
                  ? 'Décrivez ce que vous avez observé...'
                  : 'Describe what you observed...'
              }
            />
          </div>

          {/* Emoji Selection */}
          <div>
            <Label className="text-sm mb-2">
              {language === 'fr' ? 'Humeur/Réaction:' : 'Mood/Reaction:'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
                  className={`p-2 text-2xl rounded border transition-colors ${
                    selectedEmoji === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Recording */}
          <div>
            <Label className="text-sm mb-2">
              {language === 'fr' ? 'Note vocale:' : 'Voice note:'}
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'bg-red-50 border-red-300' : ''}
              >
                {isRecording ? '⏹️' : '🎤'}{' '}
                {isRecording
                  ? language === 'fr'
                    ? 'Arrêter'
                    : 'Stop'
                  : language === 'fr'
                    ? 'Enregistrer'
                    : 'Record'}
              </Button>
              {isRecording && (
                <div className="flex items-center text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2" />
                  {language === 'fr' ? 'Enregistrement...' : 'Recording...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Linking */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">
            {language === 'fr' ? "Lier aux résultats d'apprentissage" : 'Link to Learning Outcomes'}
            <span className="text-sm text-gray-500 ml-2">
              ({language === 'fr' ? 'optionnel' : 'optional'})
            </span>
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOutcomeSearch(!showOutcomeSearch)}
          >
            {showOutcomeSearch
              ? language === 'fr'
                ? 'Masquer'
                : 'Hide'
              : language === 'fr'
                ? 'Rechercher'
                : 'Search'}
          </Button>
        </div>

        {showOutcomeSearch && (
          <div className="space-y-3">
            <input
              type="text"
              value={outcomeSearchTerm}
              onChange={(e) => setOutcomeSearchTerm(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher des résultats...' : 'Search outcomes...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {filteredOutcomes.slice(0, 10).map((outcome) => (
                <label
                  key={outcome.id}
                  className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedOutcomes.includes(outcome.id)}
                    onChange={() => handleOutcomeToggle(outcome.id)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <OutcomeTag outcome={outcome} size="small" />
                </label>
              ))}
              {outcomeSearchTerm && filteredOutcomes.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {language === 'fr' ? 'Aucun résultat trouvé' : 'No outcomes found'}
                </p>
              )}
            </div>
          </div>
        )}

        {selectedOutcomes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOutcomes.map((outcomeId) => {
              const outcome = outcomes.find((o) => o.id === outcomeId);
              return outcome ? (
                <div key={outcome.id} className="flex items-center gap-1">
                  <OutcomeTag outcome={outcome} />
                  <button
                    onClick={() => handleOutcomeToggle(outcome.id)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={createReflectionMutation.isPending || selectedStudents.length === 0}
          className="px-6"
        >
          {createReflectionMutation.isPending
            ? language === 'fr'
              ? 'Enregistrement...'
              : 'Saving...'
            : language === 'fr'
              ? "Enregistrer l'évidence"
              : 'Save Evidence'}
        </Button>
      </div>
    </div>
  );
};

export default EvidenceQuickEntry;
