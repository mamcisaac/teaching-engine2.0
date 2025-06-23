import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStudents, useClassifyReflection, ClassificationResult } from '../../api';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Loader2, CheckCircle, XCircle, Copy, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface ReflectionClassifierProps {
  studentId?: number;
  initialText?: string;
  onClassificationComplete?: (result: ClassificationResult) => void;
  onAddToPortfolio?: (
    studentId: number,
    text: string,
    classification: ClassificationResult,
  ) => void;
}

const ReflectionClassifier: React.FC<ReflectionClassifierProps> = ({
  studentId: propStudentId,
  initialText = '',
  onClassificationComplete,
  onAddToPortfolio,
}) => {
  const { language } = useLanguage();
  const { data: students = [] } = useStudents();
  const classifyMutation = useClassifyReflection();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(propStudentId || null);
  const [reflectionText, setReflectionText] = useState(initialText);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [acceptedOutcomes, setAcceptedOutcomes] = useState<Set<string>>(new Set());
  const [rejectedOutcomes, setRejectedOutcomes] = useState<Set<string>>(new Set());

  const handleClassify = useCallback(() => {
    if (!selectedStudentId || !reflectionText.trim()) {
      toast.error(
        language === 'fr'
          ? 'Veuillez sélectionner un élève et saisir un texte de réflexion.'
          : 'Please select a student and enter reflection text.',
      );
      return;
    }

    setClassification(null);
    setAcceptedOutcomes(new Set());
    setRejectedOutcomes(new Set());

    classifyMutation.mutate(
      {
        studentId: selectedStudentId,
        text: reflectionText,
      },
      {
        onSuccess: (result) => {
          setClassification(result);
          onClassificationComplete?.(result);
          toast.success(
            language === 'fr'
              ? `Classification terminée: ${result.outcomes.length} résultats suggérés`
              : `Classification complete: ${result.outcomes.length} outcomes suggested`,
          );
        },
      },
    );
  }, [selectedStudentId, reflectionText, language, onClassificationComplete, classifyMutation]);

  const handleAcceptOutcome = useCallback((outcomeId: string) => {
    setAcceptedOutcomes((prev) => new Set([...prev, outcomeId]));
    setRejectedOutcomes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outcomeId);
      return newSet;
    });
  }, []);

  const handleRejectOutcome = useCallback((outcomeId: string) => {
    setRejectedOutcomes((prev) => new Set([...prev, outcomeId]));
    setAcceptedOutcomes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outcomeId);
      return newSet;
    });
  }, []);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(reflectionText);
    toast.success(
      language === 'fr' ? 'Texte copié dans le presse-papiers' : 'Text copied to clipboard',
    );
  }, [reflectionText, language]);

  const handleAddToPortfolio = useCallback(() => {
    if (!selectedStudentId || !classification) return;

    const acceptedOutcomesList = classification.outcomes.filter((outcome) =>
      acceptedOutcomes.has(outcome.id),
    );

    const portfolioClassification = {
      ...classification,
      outcomes: acceptedOutcomesList,
    };

    onAddToPortfolio?.(selectedStudentId, reflectionText, portfolioClassification);
    toast.success(
      language === 'fr'
        ? "Réflexion ajoutée au portfolio de l'élève"
        : 'Reflection added to student portfolio',
    );
  }, [selectedStudentId, reflectionText, classification, acceptedOutcomes, onAddToPortfolio]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSELTagColor = (tag: string) => {
    // Different colors for different types of SEL tags
    const colors = {
      perseverance: 'bg-blue-100 text-blue-800',
      collaboration: 'bg-purple-100 text-purple-800',
      creativity: 'bg-pink-100 text-pink-800',
      leadership: 'bg-indigo-100 text-indigo-800',
      empathy: 'bg-green-100 text-green-800',
      'self-reflection': 'bg-orange-100 text-orange-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[tag as keyof typeof colors] || colors.default;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {language === 'fr' ? 'Classificateur de Réflexions' : 'Reflection Classifier'}
          </CardTitle>
          <CardDescription>
            {language === 'fr'
              ? "Analysez les réflexions des élèves pour suggérer des résultats d'apprentissage et des compétences SEL."
              : 'Analyze student reflections to suggest learning outcomes and SEL competencies.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection */}
          {!propStudentId && (
            <div className="space-y-2">
              <Label htmlFor="student-select">
                {language === 'fr' ? 'Sélectionner un élève' : 'Select Student'}
              </Label>
              <Select
                value={selectedStudentId?.toString() || ''}
                onValueChange={(value) => setSelectedStudentId(parseInt(value))}
              >
                <SelectTrigger id="student-select">
                  <SelectValue
                    placeholder={language === 'fr' ? 'Choisir un élève...' : 'Choose a student...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reflection Text Input */}
          <div className="space-y-2">
            <Label htmlFor="reflection-text">
              {language === 'fr' ? 'Texte de réflexion' : 'Reflection Text'}
            </Label>
            <Textarea
              id="reflection-text"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder={
                language === 'fr'
                  ? "Saisissez ou collez la réflexion de l'élève ici..."
                  : 'Enter or paste student reflection here...'
              }
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleClassify}
              disabled={classifyMutation.isPending || !selectedStudentId || !reflectionText.trim()}
              className="flex-1"
            >
              {classifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'fr' ? 'Classifier la réflexion' : 'Classify Reflection'}
            </Button>
            <Button variant="outline" onClick={handleCopyText} disabled={!reflectionText.trim()}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classification Results */}
      {classification && (
        <div className="space-y-4">
          {/* Suggested Outcomes */}
          {classification.outcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'fr'
                    ? "Résultats d'apprentissage suggérés"
                    : 'Suggested Learning Outcomes'}
                </CardTitle>
                <CardDescription>
                  {language === 'fr'
                    ? 'Examinez et acceptez/rejetez chaque suggestion.'
                    : 'Review and accept/reject each suggestion.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {classification.outcomes.map((outcome) => (
                  <div key={outcome.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getConfidenceColor(outcome.confidence)}>
                            {Math.round(outcome.confidence * 100)}%
                          </Badge>
                          <span className="font-medium text-sm text-gray-600">{outcome.id}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{outcome.rationale}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={acceptedOutcomes.has(outcome.id) ? 'primary' : 'outline'}
                          onClick={() => handleAcceptOutcome(outcome.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={rejectedOutcomes.has(outcome.id) ? 'danger' : 'outline'}
                          onClick={() => handleRejectOutcome(outcome.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SEL Tags */}
          {classification.selTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'fr'
                    ? 'Compétences SEL identifiées'
                    : 'SEL Competencies Identified'}
                </CardTitle>
                <CardDescription>
                  {language === 'fr'
                    ? 'Compétences socio-émotionnelles démontrées dans cette réflexion.'
                    : 'Social-emotional competencies demonstrated in this reflection.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {classification.selTags.map((tag) => (
                    <Badge key={tag} className={getSELTagColor(tag)}>
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Actions */}
          {onAddToPortfolio && acceptedOutcomes.size > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleAddToPortfolio} className="w-full">
                  {language === 'fr'
                    ? "Ajouter au portfolio de l'élève"
                    : 'Add to Student Portfolio'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionClassifier;
