import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useETFOLessonPlans, useCreateETFOLessonPlan, useUpdateETFOLessonPlan, useDeleteETFOLessonPlan, useUnitPlan, type ETFOLessonPlan } from '../hooks/useETFOPlanning';
import { toast } from 'sonner';

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

  // Fetch unit plan details
  const { data: unitPlan } = useUnitPlan(unitId || '');

  // Fetch lesson plans for this unit
  const { data: lessons = [], isLoading, error } = useETFOLessonPlans({
    unitPlanId: unitId,
  });

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
        data: formData,
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

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#dc2626' 
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Error loading lesson plans</div>
          <div>{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px' 
    }}>
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
          onClick={() => navigate('/planner/dashboard')}
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

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            color: '#6b7280', 
            marginBottom: '16px' 
          }}>
            No lesson plans yet
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#9ca3af', 
            marginBottom: '24px' 
          }}>
            Create your first lesson plan to start organizing your daily teaching
          </p>
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
            Create Your First Lesson
          </button>
        </div>
      ) : (
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
                      {lesson.materials.map((material, i) => (
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
      )}

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
  formData: any;
  setFormData: (data: any) => void;
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
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Title *
                </label>
                <input
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
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Date *
                </label>
                <input
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
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Duration (min) *
                </label>
                <input
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Learning Goals
              </label>
              <textarea
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Minds On (Hook/Introduction)
              </label>
              <textarea
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Action (Main Activity)
              </label>
              <textarea
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Consolidation (Wrap-up)
              </label>
              <textarea
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Materials (one per line)
              </label>
              <textarea
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Assessment Notes
              </label>
              <textarea
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
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Notes for Supply Teacher
                </label>
                <textarea
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