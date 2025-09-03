import { format } from 'date-fns';
import { 
  Calendar, Clock, BookOpen, Target, Users, Package, 
  CheckCircle, AlertCircle, ChevronLeft, Edit, Trash2, Printer,
  ClipboardCheck, BarChart3
} from 'lucide-react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useETFOLessonPlan, useDeleteETFOLessonPlan } from '../hooks/useETFOPlanning';


export function LessonDetailPage(): React.ReactElement {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const deleteLesson = useDeleteETFOLessonPlan();
  
  const { data: lesson, isLoading, error } = useETFOLessonPlan(lessonId || '');
  
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading lesson...</p>
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
            <h2 className="text-xl font-semibold text-center mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 text-center mb-4">
              The lesson you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                {lesson.titleFr || lesson.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/assessment?lessonId=${lessonId}`)}
                className="bg-green-50 hover:bg-green-100 border-green-300"
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Assess Students
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/analytics?lessonId=${lessonId}`)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Progress
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
          
          {lesson.title !== lesson.titleFr && (
            <p className="text-lg text-gray-600 mb-4">{lesson.title}</p>
          )}
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.duration || 45} minutes
            </Badge>
            {lesson.unitPlan && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {lesson.unitPlan.title}
              </Badge>
            )}
            {lesson.unitPlan?.longRangePlan && (
              <Badge variant="secondary">
                {lesson.unitPlan.longRangePlan.subject}
              </Badge>
            )}
            {lesson.assessmentType && (
              <Badge variant="outline">
                {lesson.assessmentType}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Learning Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectifs d'apprentissage (Français)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.learningGoalsFr && lesson.learningGoalsFr.length > 0 ? (
                <div className="space-y-2">
                  <p>{lesson.learningGoalsFr}</p>
                </div>
              ) : (
                <p className="text-gray-500">Aucun objectif défini</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals (English)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.learningGoals && lesson.learningGoals.length > 0 ? (
                <div className="space-y-2">
                  <p>{lesson.learningGoals}</p>
                </div>
              ) : (
                <p className="text-gray-500">No goals defined</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Three-Part Lesson Structure */}
        <div className="space-y-6 mb-6">
          {/* Minds On */}
          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-700">Mise en train / Minds On</CardTitle>
              <p className="text-sm text-gray-600">Engagement et activation (10 minutes)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Français</h4>
                  <p className="text-gray-700">{lesson.mindsOnFr || 'Non défini'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">English</h4>
                  <p className="text-gray-700">{lesson.mindsOn || 'Not defined'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action */}
          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-700">Action / Working On It</CardTitle>
              <p className="text-sm text-gray-600">Activité principale (25 minutes)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Français</h4>
                  <p className="text-gray-700">{lesson.actionFr || 'Non défini'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">English</h4>
                  <p className="text-gray-700">{lesson.action || 'Not defined'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Consolidation */}
          <Card className="border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="text-purple-700">Consolidation / Reflection</CardTitle>
              <p className="text-sm text-gray-600">Synthèse et réflexion (10 minutes)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Français</h4>
                  <p className="text-gray-700">{lesson.consolidationFr || 'Non défini'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">English</h4>
                  <p className="text-gray-700">{lesson.consolidation || 'Not defined'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Materials and Differentiation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Matériaux / Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.materials && lesson.materials.length > 0 ? (
                <ul className="space-y-1">
                  {lesson.materials.map((material, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucun matériel spécifié</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Différenciation / Differentiation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lesson.differentiationStrategies?.forStruggling && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Pour ceux qui ont des difficultés:</p>
                    <p className="text-sm text-gray-700">{lesson.differentiationStrategies.forStruggling}</p>
                  </div>
                )}
                {lesson.differentiationStrategies?.forAdvanced && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Pour ceux qui sont avancés:</p>
                    <p className="text-sm text-gray-700">{lesson.differentiationStrategies.forAdvanced}</p>
                  </div>
                )}
                {!lesson.differentiationStrategies?.forStruggling && !lesson.differentiationStrategies?.forAdvanced && (
                  <p className="text-gray-500">Aucune stratégie définie</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Assessment */}
        {(lesson.assessmentType || lesson.assessmentNotes) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Évaluation / Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.assessmentType && (
                  <div>
                    <h4 className="font-semibold mb-2">Type d'évaluation:</h4>
                    <p className="text-gray-700">{lesson.assessmentType}</p>
                  </div>
                )}
                {lesson.assessmentNotes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes d'évaluation:</h4>
                    <p className="text-gray-700">{lesson.assessmentNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Curriculum Expectations */}
        {lesson.expectations && lesson.expectations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attentes du curriculum / Curriculum Expectations</CardTitle>
                <Button
                  size="sm"
                  onClick={() => navigate(`/assessment?lessonId=${lessonId}&expectations=${lesson.expectations?.map(e => e.expectation.id).join(',')}`)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Assess These Expectations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lesson.expectations.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <Badge variant="outline" className="mt-0.5">
                      {item.expectation.code}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.expectation.descriptionFr || item.expectation.description}</p>
                      {item.expectation.descriptionFr && item.expectation.description !== item.expectation.descriptionFr && (
                        <p className="text-xs text-gray-600 mt-1">{item.expectation.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/assessment?expectationId=${item.expectation.id}`)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ClipboardCheck className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Notes */}
        {lesson.subNotes && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Substitute Notes:</strong> {lesson.subNotes}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}