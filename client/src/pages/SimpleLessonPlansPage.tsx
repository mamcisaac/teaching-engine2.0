import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCreateETFOLessonPlan, useUpdateETFOLessonPlan, useDeleteETFOLessonPlan, type ETFOLessonPlan } from '../hooks/useETFOPlanning';

// Type definitions
interface UnitPlan {
  id: string;
  title: string;
  longRangePlan: {
    subject: string;
    grade: number;
  };
}

interface LessonPlan {
  id: string;
  title: string;
  date: string;
  duration: number;
  learningGoals: string;
  mindsOn: string;
  action: string;
  consolidation: string;
  materials: string[];
  isSubFriendly: boolean;
  unitPlanId: string;
  [key: string]: unknown;
}

interface FormData {
  title: string;
  date: string;
  duration: number;
  learningGoals: string;
  mindsOn: string;
  action: string;
  consolidation: string;
  materials: string[];
  assessmentNotes: string;
  accommodations: string[];
  isSubFriendly: boolean;
  subNotes: string;
}

// Simple lesson plans page connected to backend APIs
export function SimpleLessonPlansPage(): React.ReactElement {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ETFOLessonPlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    learningGoals: '',
    mindsOn: '',
    action: '',
    consolidation: '',
    materials: [] as string[],
    assessmentNotes: '',
    accommodations: [] as string[],
    isSubFriendly: false,
    subNotes: '',
  });

  // Use hardcoded data for Emily's Grade 1 French Immersion
  const unitPlans: Record<string, UnitPlan> = {
    'unit-1': {
      id: 'unit-1',
      title: 'Bienvenue à l\'école!',
      longRangePlan: {
        subject: 'Français (Immersion)',
        grade: 1
      }
    },
    'unit-2': {
      id: 'unit-2',
      title: 'Ma famille et moi',
      longRangePlan: {
        subject: 'Français (Immersion)',
        grade: 1
      }
    },
    'unit-3': {
      id: 'unit-3',
      title: 'Les saisons et les fêtes',
      longRangePlan: {
        subject: 'Français (Immersion)',
        grade: 1
      }
    },
    'unit-4': {
      id: 'unit-4',
      title: 'Les animaux et leurs habitats',
      longRangePlan: {
        subject: 'Sciences de la nature',
        grade: 1
      }
    },
    'unit-5': {
      id: 'unit-5',
      title: 'Notre communauté',
      longRangePlan: {
        subject: 'Sciences humaines',
        grade: 1
      }
    },
    'unit-6': {
      id: 'unit-6',
      title: 'Les plantes et le jardinage',
      longRangePlan: {
        subject: 'Sciences de la nature',
        grade: 1
      }
    },
    'unit-7': {
      id: 'unit-7',
      title: 'L\'été arrive!',
      longRangePlan: {
        subject: 'Français (Immersion)',
        grade: 1
      }
    }
  };

  const unitPlan = unitPlans[unitId || 'unit-1'] || unitPlans['unit-1'];

  // Hardcoded lesson plans data
  const lessonsByUnit: Record<string, LessonPlan[]> = {
    'unit-1': [
      {
        id: 'lesson-1-1',
        title: 'Bienvenue en immersion française!',
        date: '2025-09-04',
        duration: 60,
        learningGoals: 'Students will learn basic French greetings and classroom vocabulary',
        mindsOn: 'Welcome circle, Bonjour song, name games with rhythm (15 min)',
        action: 'Classroom tour in French, practice greetings, create self-portraits (35 min)',
        consolidation: 'Share portraits, goodbye song, celebrate first day (10 min)',
        materials: ['Name tags', 'Crayons', 'Paper', 'Bonjour song'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Focus on making students comfortable with French sounds'
      },
      {
        id: 'lesson-1-2',
        title: 'Notre communauté de classe',
        date: '2025-09-05',
        duration: 60,
        learningGoals: 'Students will learn classroom routines and expectations in French',
        mindsOn: 'Review greetings, introduce classroom signals (15 min)',
        action: 'Create classroom rules poster together, practice routines (35 min)',
        consolidation: 'Classroom jobs assignment, celebration dance (10 min)',
        materials: ['Poster board', 'Markers', 'Job chart', 'Music'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Maintain consistent French exposure, use gestures'
      },
      {
        id: 'lesson-1-3',
        title: 'Le français partout',
        date: '2025-09-08',
        duration: 60,
        learningGoals: 'Students will identify French in their environment',
        mindsOn: 'French detective game - find French words in classroom (15 min)',
        action: 'Label classroom objects in French, word wall creation (35 min)',
        consolidation: 'French word scavenger hunt (10 min)',
        materials: ['Labels', 'Word cards', 'Tape', 'Markers'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Emphasize visual learning and repetition'
      },
      {
        id: 'lesson-1-4',
        title: 'Les jours de la semaine',
        date: '2025-09-09',
        duration: 60,
        learningGoals: 'Students will learn days of the week in French',
        mindsOn: 'Days of the week song with actions (15 min)',
        action: 'Create weekly calendar, practice daily routines (35 min)',
        consolidation: 'Calendar helper assignment (10 min)',
        materials: ['Calendar template', 'Day cards', 'Songs', 'Stickers'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Use songs and movement to reinforce learning'
      },
      {
        id: 'lesson-1-5',
        title: 'Nos noms spéciaux',
        date: '2025-09-10',
        duration: 60,
        learningGoals: 'Students will practice introducing themselves in French',
        mindsOn: 'Name rhythm game in circle (15 min)',
        action: 'Create name art with French decorations (35 min)',
        consolidation: 'Gallery walk and introductions (10 min)',
        materials: ['Art supplies', 'Name templates', 'French stickers'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Celebrate each child\'s identity in French'
      }
    ],
    'unit-2': [
      {
        id: 'lesson-2-1',
        title: 'Ma famille',
        date: '2025-10-01',
        duration: 60,
        learningGoals: 'Students will learn family vocabulary in French',
        mindsOn: 'Family photo sharing circle (15 min)',
        action: 'Create family tree with French labels (35 min)',
        consolidation: 'Present family members in French (10 min)',
        materials: ['Family photos', 'Tree template', 'Vocabulary cards'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Be sensitive to diverse family structures'
      },
      {
        id: 'lesson-2-2',
        title: 'Les émotions',
        date: '2025-10-02',
        duration: 60,
        learningGoals: 'Students will express feelings in French',
        mindsOn: 'Emotion charades game (15 min)',
        action: 'Create emotion wheel, practice expressions (35 min)',
        consolidation: 'Feelings check-in routine established (10 min)',
        materials: ['Emotion cards', 'Mirror', 'Wheel template'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Use facial expressions and gestures'
      },
      {
        id: 'lesson-2-3',
        title: 'Mon portrait',
        date: '2025-10-03',
        duration: 60,
        learningGoals: 'Students will describe themselves in French',
        mindsOn: 'Mirror exploration with French descriptions (15 min)',
        action: 'Self-portrait creation with labels (35 min)',
        consolidation: 'Portrait gallery presentation (10 min)',
        materials: ['Mirrors', 'Art supplies', 'Body part labels'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Focus on positive self-image'
      }
    ],
    'unit-3': [
      {
        id: 'lesson-3-1',
        title: 'L\'automne arrive',
        date: '2025-11-03',
        duration: 60,
        learningGoals: 'Students will describe autumn changes in French',
        mindsOn: 'Autumn nature walk observations (15 min)',
        action: 'Create autumn collage with French labels (35 min)',
        consolidation: 'Share autumn discoveries (10 min)',
        materials: ['Leaves', 'Glue', 'Construction paper', 'Labels'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Connect to local environment'
      },
      {
        id: 'lesson-3-2',
        title: 'Les fêtes d\'hiver',
        date: '2025-12-01',
        duration: 60,
        learningGoals: 'Students will learn winter celebration vocabulary',
        mindsOn: 'Winter celebration traditions sharing (15 min)',
        action: 'Create celebration cards in French (35 min)',
        consolidation: 'Card exchange activity (10 min)',
        materials: ['Card stock', 'Decorations', 'French phrases'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Include diverse cultural celebrations'
      }
    ],
    'unit-4': [
      {
        id: 'lesson-4-1',
        title: 'Les animaux domestiques',
        date: '2026-01-06',
        duration: 60,
        learningGoals: 'Students will learn pet vocabulary in French',
        mindsOn: 'Pet sounds guessing game (15 min)',
        action: 'Create pet care guide in French (35 min)',
        consolidation: 'Pet show and tell (10 min)',
        materials: ['Animal pictures', 'Care charts', 'Stuffed animals'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Include pets and animals from home'
      },
      {
        id: 'lesson-4-2',
        title: 'Les animaux sauvages',
        date: '2026-01-07',
        duration: 60,
        learningGoals: 'Students will learn wild animal vocabulary',
        mindsOn: 'Animal movement game (15 min)',
        action: 'Create animal habitat diorama (35 min)',
        consolidation: 'Habitat presentations (10 min)',
        materials: ['Boxes', 'Natural materials', 'Animal figures'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Focus on Canadian animals'
      }
    ],
    'unit-5': [
      {
        id: 'lesson-5-1',
        title: 'Notre école',
        date: '2026-02-17',
        duration: 60,
        learningGoals: 'Students will describe school spaces in French',
        mindsOn: 'School tour preparation (15 min)',
        action: 'Create school map with French labels (35 min)',
        consolidation: 'Virtual tour recording (10 min)',
        materials: ['Map template', 'Photos', 'Labels'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Include all school community members'
      },
      {
        id: 'lesson-5-2',
        title: 'Les métiers',
        date: '2026-02-18',
        duration: 60,
        learningGoals: 'Students will learn community helper vocabulary',
        mindsOn: 'Community helper charades (15 min)',
        action: 'Interview preparation for guest speaker (35 min)',
        consolidation: 'Thank you cards creation (10 min)',
        materials: ['Costume pieces', 'Interview cards', 'Art supplies'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Prepare questions in advance'
      }
    ],
    'unit-6': [
      {
        id: 'lesson-6-1',
        title: 'Les graines magiques',
        date: '2026-04-01',
        duration: 60,
        learningGoals: 'Students will learn plant vocabulary in French',
        mindsOn: 'Seed exploration with magnifying glasses (15 min)',
        action: 'Plant seeds and create growth charts (35 min)',
        consolidation: 'Plant care schedule creation (10 min)',
        materials: ['Seeds', 'Pots', 'Soil', 'Charts'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Set up daily watering routine'
      },
      {
        id: 'lesson-6-2',
        title: 'Notre jardin',
        date: '2026-04-02',
        duration: 60,
        learningGoals: 'Students will plan a class garden in French',
        mindsOn: 'Garden vegetable tasting (15 min)',
        action: 'Design garden layout with French labels (35 min)',
        consolidation: 'Garden journal setup (10 min)',
        materials: ['Graph paper', 'Vegetable cards', 'Samples'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Connect to healthy eating'
      }
    ],
    'unit-7': [
      {
        id: 'lesson-7-1',
        title: 'Les vacances d\'été',
        date: '2026-06-01',
        duration: 60,
        learningGoals: 'Students will discuss summer plans in French',
        mindsOn: 'Summer activity brainstorm (15 min)',
        action: 'Create summer bucket list poster (35 min)',
        consolidation: 'Summer songs celebration (10 min)',
        materials: ['Poster board', 'Magazines', 'Markers'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Celebrate year-long French journey'
      },
      {
        id: 'lesson-7-2',
        title: 'Notre année ensemble',
        date: '2026-06-25',
        duration: 60,
        learningGoals: 'Students will reflect on their French learning journey',
        mindsOn: 'Year in review photo slideshow (15 min)',
        action: 'Create memory book pages (35 min)',
        consolidation: 'Celebration and certificates (10 min)',
        materials: ['Photos', 'Memory book', 'Certificates'],
        isSubFriendly: true,
        unitPlanId: 'unit-1',
        subNotes: 'Celebrate every student\'s growth'
      }
    ]
  };

  const lessons = lessonsByUnit[unitId || 'unit-1'] || lessonsByUnit['unit-1'];
  const isLoading = false;
  const _error: Error | null = null;

  // Mutations
  const createMutation = useCreateETFOLessonPlan();
  const updateMutation = useUpdateETFOLessonPlan();
  const deleteMutation = useDeleteETFOLessonPlan();

  const handleCreateLesson = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!unitId) return;
    
    try {
      await createMutation.mutateAsync({
        ...formData,
        unitPlanId: unitId,
      });
      toast.success('Lesson plan created successfully!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create lesson plan');
    }
  };

  const handleEditLesson = (lesson: ETFOLessonPlan): void => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      date: lesson.date.split('T')[0],
      duration: lesson.duration,
      learningGoals: lesson.learningGoals || '',
      mindsOn: lesson.mindsOn || '',
      action: lesson.action || '',
      consolidation: lesson.consolidation || '',
      materials: lesson.materials || [],
      assessmentNotes: lesson.assessmentNotes || '',
      accommodations: lesson.accommodations || [],
      isSubFriendly: lesson.isSubFriendly,
      subNotes: lesson.subNotes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateLesson = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingLesson) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingLesson.id,
        data: {
          ...formData,
          unitPlanId: editingLesson.unitPlanId,
        },
      });
      toast.success('Lesson plan updated successfully!');
      setShowEditModal(false);
      setEditingLesson(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update lesson plan');
    }
  };

  const handleDeleteLesson = async (lessonId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this lesson plan?')) {
      try {
        await deleteMutation.mutateAsync(lessonId);
        toast.success('Lesson plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete lesson plan');
      }
    }
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      learningGoals: '',
      mindsOn: '',
      action: '',
      consolidation: '',
      materials: [],
      assessmentNotes: '',
      accommodations: [],
      isSubFriendly: false,
      subNotes: '',
    });
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading lesson plans...</div>
        </div>
      </div>
    );
  }

  // Error handling removed - error is always null in this implementation
  // TODO: Implement proper error handling when connecting to real API

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px' 
    }}>
      {/* Back to Dashboard Link */}
      <div style={{ marginBottom: '16px' }}>
        <a 
          href="/dashboard" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '16px'
          }}
        >
          <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>
      
      {/* Breadcrumb */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '14px', 
        color: '#6b7280', 
        marginBottom: '24px' 
      }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ 
            color: '#6b7280', 
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Dashboard
        </button>
        <span>›</span>
        <button 
          onClick={() => navigate('/planner/long-range')}
          style={{ 
            color: '#6b7280', 
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Long Range Plans
        </button>
        <span>›</span>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            color: '#6b7280', 
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Unit Plans
        </button>
        <span>›</span>
        <span style={{ color: '#1f2937', fontWeight: '500' }}>
          {unitPlan?.title || 'Lesson Plans'}
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Daily Lesson Plans
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '18px'
        }}>
          {unitPlan?.title} - {unitPlan?.longRangePlan?.subject} Grade {unitPlan?.longRangePlan?.grade}
        </p>
      </div>

      {/* Actions Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ color: '#6b7280' }}>
          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} planned
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Create Lesson Plan
        </button>
      </div>

      {/* Lessons list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {lessons.map((lesson) => {
            const lessonDate = new Date(lesson.date);
            const weekday = lessonDate.toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = lessonDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            });

            return (
              <div 
                key={lesson.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '24px'
                }}
              >
                {/* Lesson Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '24px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      {lesson.title}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      <span>{weekday}, {formattedDate}</span>
                      <span>•</span>
                      <span>{lesson.duration} minutes</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Learning Goals */}
                {lesson.learningGoals && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      Learning Goals
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#4b5563',
                      lineHeight: '1.6'
                    }}>
                      {lesson.learningGoals}
                    </p>
                  </div>
                )}

                {/* Lesson Sections */}
                <div style={{ 
                  display: 'grid', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Minds On */}
                  {lesson.mindsOn && (
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#92400e',
                        marginBottom: '8px'
                      }}>
                        Minds On
                      </h5>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#78350f',
                        lineHeight: '1.6'
                      }}>
                        {lesson.mindsOn}
                      </p>
                    </div>
                  )}

                  {/* Action */}
                  {lesson.action && (
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3b82f6'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1e3a8a',
                        marginBottom: '8px'
                      }}>
                        Action
                      </h5>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#1e40af',
                        lineHeight: '1.6'
                      }}>
                        {lesson.action}
                      </p>
                    </div>
                  )}

                  {/* Consolidation */}
                  {lesson.consolidation && (
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#d1fae5',
                      borderRadius: '8px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#065f46',
                        marginBottom: '8px'
                      }}>
                        Consolidation
                      </h5>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#047857',
                        lineHeight: '1.6'
                      }}>
                        {lesson.consolidation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Materials */}
                {lesson.materials && lesson.materials.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      Materials
                    </h5>
                    <ul style={{ 
                      fontSize: '14px', 
                      color: '#4b5563',
                      paddingLeft: '20px',
                      margin: 0
                    }}>
                      {lesson.materials.map((material: string, i: number) => (
                        <li key={i}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sub-Friendly Badge */}
                {lesson.isSubFriendly && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <span>✅</span>
                    <span>Sub-Friendly Plan</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <LessonFormModal
          title="Create Lesson Plan"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateLesson}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Edit Lesson Modal */}
      {showEditModal && (
        <LessonFormModal
          title="Edit Lesson Plan"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateLesson}
          onCancel={() => {
            setShowEditModal(false);
            setEditingLesson(null);
            resetForm();
          }}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Reusable form modal component
function LessonFormModal({ 
  title, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: {
  title: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}): React.ReactElement {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '24px' 
        }}>
          {title}
        </h2>
        
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="lesson-title" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Title *
                </label>
                <input
                  id="lesson-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Introduction to French Greetings"
                />
              </div>

              <div>
                <label htmlFor="lesson-date" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Date *
                </label>
                <input
                  id="lesson-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="lesson-duration" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Duration (min) *
                </label>
                <input
                  id="lesson-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  required
                  min="15"
                  step="5"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="lesson-learning-goals" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Learning Goals
              </label>
              <textarea
                id="lesson-learning-goals"
                value={formData.learningGoals}
                onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="What will students know and be able to do by the end of this lesson?"
              />
            </div>

            <div>
              <label htmlFor="lesson-minds-on" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Minds On (Hook/Introduction)
              </label>
              <textarea
                id="lesson-minds-on"
                value={formData.mindsOn}
                onChange={(e) => setFormData({ ...formData, mindsOn: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="How will you engage students and activate prior knowledge?"
              />
            </div>

            <div>
              <label htmlFor="lesson-action" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Action (Main Activity)
              </label>
              <textarea
                id="lesson-action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="What will students do to learn and practice the concepts?"
              />
            </div>

            <div>
              <label htmlFor="lesson-consolidation" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Consolidation (Wrap-up)
              </label>
              <textarea
                id="lesson-consolidation"
                value={formData.consolidation}
                onChange={(e) => setFormData({ ...formData, consolidation: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="How will students consolidate their learning?"
              />
            </div>

            <div>
              <label htmlFor="lesson-materials" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Materials (one per line)
              </label>
              <textarea
                id="lesson-materials"
                value={formData.materials.join('\n')}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value.split('\n').filter(m => m.trim()) })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Chart paper
Markers
Student notebooks"
              />
            </div>

            <div>
              <label htmlFor="lesson-assessment-notes" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Assessment Notes
              </label>
              <textarea
                id="lesson-assessment-notes"
                value={formData.assessmentNotes}
                onChange={(e) => setFormData({ ...formData, assessmentNotes: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="How will you assess student learning?"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="subFriendly"
                checked={formData.isSubFriendly}
                onChange={(e) => setFormData({ ...formData, isSubFriendly: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="subFriendly" style={{ fontWeight: '500' }}>
                This is a sub-friendly lesson plan
              </label>
            </div>

            {formData.isSubFriendly && (
              <div>
                <label htmlFor="lesson-sub-notes" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Notes for Supply Teacher
                </label>
                <textarea
                  id="lesson-sub-notes"
                  value={formData.subNotes}
                  onChange={(e) => setFormData({ ...formData, subNotes: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Special instructions or context for a supply teacher..."
                />
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isSubmitting ? '#9ca3af' : '#4f46e5',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Lesson Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}