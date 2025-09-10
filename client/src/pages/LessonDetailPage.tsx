/**
 * Lesson Detail Page - Displays full lesson with French content and JSON pedagogy
 * Uses the new /api/lessons endpoints to fetch and display Emily's lesson data
 */

import { 
  Calendar, Clock, BookOpen, Target, Users, Package, 
  AlertCircle, ChevronLeft, Edit, Trash2, Printer,
  ClipboardCheck, BarChart3, Globe, Heart, Eye, Brain, Copy, Check
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatDate, formatOr } from '../utils/safeDate';
import { useDeleteETFOLessonPlan } from '../hooks/useETFOPlanning';

// Type for the lesson view from server
interface LessonView {
  id: string;
  userId: number;
  unitPlanId?: string | null;
  
  // Labels
  title: string;
  subject?: string | null;
  grade?: number | null;
  language?: string | null;
  
  // Dates & scheduling
  date?: string | null;
  duration?: number | null;
  lessonNumber?: number | null;
  slotNumber?: number | null;
  lessonType?: string | null;
  isScheduled?: number | boolean | null;
  
  // Three-part lesson
  learningGoals?: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;
  
  // Logistics
  materials?: string | null;
  grouping?: string | null;
  
  // Assessment
  assessmentType?: string | null;
  assessmentNotes?: string | null;
  
  // JSON pedagogy
  differentiation: string[];
  hooks: {
    vocabulary: string[];
    visualSupports: string[];
    movementBreaks: string[];
    other: string[];
  };
  reflectionActivities: string[];
  indigenousPerspectives: string[];
  
  // Supply
  isSubFriendly?: number | boolean | null;
  subNotes?: string | null;
}

interface AssessmentContext {
  lesson: {
    id: string;
    title: string;
    date?: string | null;
    subject?: string | null;
  };
  expectations: Array<{
    id: string;
    code: string;
    text: string;
  }>;
}

export function LessonDetailPage(): React.ReactElement {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const deleteLesson = useDeleteETFOLessonPlan();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Fetch lesson data from new endpoint
  // Copy to clipboard helper
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copié!');
    } catch (err) {
      toast.error('Erreur de copie');
    }
  };

  // Keyboard navigation ([ and ] for prev/next lesson)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target !== document.body) return; // Ignore if typing in input
      
      if (e.key === '[') {
        // Navigate to previous lesson (implementation would need lesson order)
        toast.info('Navigation précédente à implémenter');
      } else if (e.key === ']') {
        // Navigate to next lesson (implementation would need lesson order)
        toast.info('Navigation suivante à implémenter');
      } else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlePrint();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const { data: lesson, isLoading, error } = useQuery<LessonView>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      console.log('Fetching lesson with ID:', lessonId);
      const response = await apiClient.get(`/api/lessons/${lessonId}`);
      console.log('Response status:', response.status);
      console.log('Received lesson:', response.data.id, response.data.title);
      return response.data;
    },
    enabled: !!lessonId
  });
  
  // Fetch assessment context in parallel
  const { data: context } = useQuery<AssessmentContext>({
    queryKey: ['lesson-assessment', lessonId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/lessons/${lessonId}/assessment-context`);
        return response.data;
      } catch (err) {
        console.log('Failed to fetch assessment context:', err);
        return { lesson: null, expectations: [] };
      }
    },
    enabled: !!lessonId
  });
  
  const handleEdit = () => {
    navigate(`/planner/lessons/${lessonId}/edit`);
  };
  
  const handleDelete = async () => {
    if (!lessonId) return;
    
    if (window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      try {
        await deleteLesson.mutateAsync(lessonId);
        toast.success('Lesson deleted successfully');
        navigate(-1);
      } catch (error) {
        toast.error('Failed to delete lesson');
      }
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleAssess = () => {
    // Navigate to assessment with lesson context
    const expIds = context?.expectations?.map(e => e.id).join(',');
    const url = expIds 
      ? `/assessment?lessonId=${lessonId}&exp=${expIds}`
      : `/assessment?lessonId=${lessonId}`;
    navigate(url);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }
  
  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center mb-2">Leçon introuvable</h2>
            <p className="text-gray-600 text-center mb-4">
              La leçon que vous recherchez n&apos;existe pas ou a été supprimée.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Parse materials if it's a string
  const materialsList = typeof lesson.materials === 'string' 
    ? lesson.materials.split(/[,;\n]/).map(m => m.trim()).filter(Boolean)
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50" data-testid="lesson-detail">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold truncate max-w-md">
                {lesson.title}
              </h1>
              {lesson.date && (
                <Badge variant="outline">
                  {formatDate(lesson.date)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden md:inline">Imprimer</span>
              </Button>
              <Button
                onClick={handleAssess}
                className="flex items-center gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                Évaluer la classe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="lesson-title">
                {lesson.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleAssess}
                className="bg-green-50 hover:bg-green-100 border-green-300"
                data-testid="assess-button"
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Évaluer la classe
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(lesson.date)}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.duration || 45} minutes
            </Badge>
            {lesson.subject && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {lesson.subject}
              </Badge>
            )}
            {lesson.grade && (
              <Badge variant="secondary">
                {lesson.language === 'fr' ? `${lesson.grade}e année` : `Grade ${lesson.grade}`}
              </Badge>
            )}
            {lesson.slotNumber && (
              <Badge variant="outline">
                Slot {lesson.slotNumber}
              </Badge>
            )}
            {lesson.lessonType && (
              <Badge variant="outline">
                {lesson.lessonType}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Learning Goals */}
        {lesson.learningGoals && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs d&apos;apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lesson.learningGoals}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Three-Part Lesson Structure */}
        <div className="space-y-6 mb-6">
          {/* Minds On */}
          {lesson.mindsOn && (
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-700">Mise en train</CardTitle>
                <p className="text-sm text-gray-600">Engagement et activation (10 minutes)</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap" data-testid="part-mindsOn">{lesson.mindsOn}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Action */}
          {lesson.action && (
            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-700">Action</CardTitle>
                <p className="text-sm text-gray-600">Activité principale (25 minutes)</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap" data-testid="part-action">{lesson.action}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Consolidation */}
          {lesson.consolidation && (
            <Card className="border-l-4 border-purple-500">
              <CardHeader>
                <CardTitle className="text-purple-700">Consolidation</CardTitle>
                <p className="text-sm text-gray-600">Synthèse et réflexion (10 minutes)</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap" data-testid="part-consolidation">{lesson.consolidation}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Differentiation from JSON */}
        {lesson.differentiation && lesson.differentiation.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Différenciation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2" data-testid="diff-list">
                {lesson.differentiation.map((strategy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Engagement Hooks from JSON */}
        {(lesson.hooks.vocabulary.length > 0 || 
          lesson.hooks.visualSupports.length > 0 || 
          lesson.hooks.movementBreaks.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Accroches et soutiens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lesson.hooks.vocabulary.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Vocabulaire
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(lesson.hooks.vocabulary.join('\n'), 'vocabulary')}
                        className="h-6 px-2"
                      >
                        {copiedField === 'vocabulary' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </h4>
                    <ul className="space-y-1">
                      {lesson.hooks.vocabulary.map((word, idx) => (
                        <li key={idx} className="text-sm">{word}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lesson.hooks.visualSupports.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Soutiens visuels
                    </h4>
                    <ul className="space-y-1">
                      {lesson.hooks.visualSupports.map((support, idx) => (
                        <li key={idx} className="text-sm">{support}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lesson.hooks.movementBreaks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      Mises en mouvement
                    </h4>
                    <ul className="space-y-1">
                      {lesson.hooks.movementBreaks.map((movement, idx) => (
                        <li key={idx} className="text-sm">{movement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Materials and Grouping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {materialsList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Matériel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {materialsList.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
                {lesson.grouping && (
                  <p className="mt-4 text-sm">
                    <span className="font-semibold">Regroupement:</span> {lesson.grouping}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Assessment */}
          {(lesson.assessmentType || lesson.assessmentNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Évaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.assessmentType && (
                  <p className="mb-2">
                    <span className="font-semibold">Type:</span> {lesson.assessmentType}
                  </p>
                )}
                {lesson.assessmentNotes && (
                  <p className="whitespace-pre-wrap">{lesson.assessmentNotes}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Reflection Activities */}
        {lesson.reflectionActivities && lesson.reflectionActivities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activités de réflexion</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.reflectionActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Indigenous Perspectives */}
        {lesson.indigenousPerspectives && lesson.indigenousPerspectives.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Perspectives autochtones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.indigenousPerspectives.map((perspective, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{perspective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Sub-friendly Notes */}
        {lesson.isSubFriendly && (
          <Alert className="mb-6">
            <AlertDescription>
              <Badge className="mb-2">Cours remplaçant friendly</Badge>
              {lesson.subNotes && (
                <p className="mt-2">{lesson.subNotes}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Linked Expectations */}
        {context?.expectations && context.expectations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attentes du curriculum liées</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {context.expectations.map((exp) => (
                  <li key={exp.id} className="flex items-start gap-2">
                    <Badge variant="outline" className="flex-shrink-0">{exp.code}</Badge>
                    <span className="text-sm">{exp.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={handleAssess}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Évaluer la classe
          </Button>
          {lesson.date && (
            <Link 
              to={`/planner/day?d=${encodeURIComponent(lesson.date)}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Ouvrir la journée
            </Link>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}