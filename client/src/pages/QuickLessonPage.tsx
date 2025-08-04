
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCreateETFOLessonPlan, useUnitPlans } from '../hooks/useETFOPlanning';

export function QuickLessonPage(): React.ReactElement {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user's unit plans to allow selection
  const { data: unitPlans = [] } = useUnitPlans({});
  const createMutation = useCreateETFOLessonPlan();

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    unitPlanId: '',
    learningGoals: '',
    mindsOn: '',
    action: '',
    consolidation: '',
    materials: '',
    assessmentNotes: '',
    isSubFriendly: false,
    differentiationStrategies: {
      forStruggling: '',
      forAdvanced: '',
      forELL: '',
      forIEP: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (!formData.unitPlanId) {
      toast.error('Please select a unit plan');
      return;
    }

    setIsSubmitting(true);

    try {
      const lessonData = {
        title: formData.title,
        date: formData.date,
        duration: formData.duration,
        unitPlanId: formData.unitPlanId,
        learningGoals: formData.learningGoals,
        mindsOn: formData.mindsOn,
        action: formData.action,
        consolidation: formData.consolidation,
        materials: formData.materials.split('\n').filter(m => m.trim()),
        assessmentNotes: formData.assessmentNotes,
        isSubFriendly: formData.isSubFriendly,
        differentiationStrategies: formData.differentiationStrategies
      };

      await createMutation.mutateAsync(lessonData);
      toast.success('Quick lesson created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        unitPlanId: '',
        learningGoals: '',
        mindsOn: '',
        action: '',
        consolidation: '',
        materials: '',
        assessmentNotes: '',
        isSubFriendly: false,
        differentiationStrategies: {
          forStruggling: '',
          forAdvanced: '',
          forELL: '',
          forIEP: ''
        }
      });
    } catch (error) {
      toast.error('Failed to create lesson. Please try again.');
      console.error('Error creating lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Breadcrumbs items={[
          { label: 'Dashboard', path: '/planner/dashboard' },
          { label: 'Quick Lesson Planner' }
        ]} />
        
        <div style={{ 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              ⚡ Quick Lesson Planner
            </h1>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>
              Create a lesson plan quickly for today or upcoming classes
            </p>
          </div>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            title="Print lesson plan"
          >
            🖨️ Print Lesson
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
        }}>
          {/* Basic Information */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
              Basic Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 100px', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Introduction to Numbers 1-10"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Choose a clear, descriptive title that reflects the main learning objective
                </span>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="5"
                  max="300"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Unit Plan *
              </label>
              <select
                value={formData.unitPlanId}
                onChange={(e) => handleInputChange('unitPlanId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="">Select a unit plan...</option>
                {unitPlans.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title}
                  </option>
                ))}
              </select>
              {unitPlans.length === 0 && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
                  No unit plans found. Create a unit plan first to organize your lessons.
                </p>
              )}
            </div>
          </div>

          {/* Learning Goals */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
              Learning Goals
            </label>
            <textarea
              value={formData.learningGoals}
              onChange={(e) => handleInputChange('learningGoals', e.target.value)}
              placeholder="What will students learn in this lesson?"
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
              Example: "Students will identify and count numbers 1-10 in French using manipulatives"
            </span>
          </div>

          {/* Three-Part Lesson Structure */}
          <div style={{ 
            marginBottom: '30px',
            border: '2px solid #4f46e5',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f0f4ff'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#4f46e5', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📚 ETFO Three-Part Lesson Structure
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                REQUIRED
              </span>
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              marginBottom: '16px',
              fontStyle: 'italic'
            }}>
              All lessons must follow the ETFO-mandated three-part structure for effective teaching
            </p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '5px',
                  backgroundColor: '#e0f2fe',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0ea5e9'
                }}>
                  1️⃣ Minds-On (Hook/Introduction) • ~10-15% of lesson time
                </label>
                <textarea
                  value={formData.mindsOn}
                  onChange={(e) => handleInputChange('mindsOn', e.target.value)}
                  placeholder="How will you capture students' attention and activate prior knowledge?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block', fontStyle: 'italic' }}>
                  Example: "Show mystery bag with counting bears. Ask: 'Combien d'ours pensez-vous qu'il y a?' Have students predict and share."
                </span>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '5px',
                  backgroundColor: '#d1fae5',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #10b981'
                }}>
                  2️⃣ Action (Main Learning Activities) • ~60-70% of lesson time
                </label>
                <textarea
                  value={formData.action}
                  onChange={(e) => handleInputChange('action', e.target.value)}
                  placeholder="What activities will students do to learn the new content?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block', fontStyle: 'italic' }}>
                  Example: "1) Counting station rotations with manipulatives 2) Partner counting games 3) Number writing practice on whiteboards"
                </span>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '5px',
                  backgroundColor: '#fef3c7',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b'
                }}>
                  3️⃣ Consolidation (Wrap-up/Assessment) • ~15-20% of lesson time
                </label>
                <textarea
                  value={formData.consolidation}
                  onChange={(e) => handleInputChange('consolidation', e.target.value)}
                  placeholder="How will you summarize learning and check for understanding?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block', fontStyle: 'italic' }}>
                  Example: "Gallery walk to share counting collections. Exit ticket: Draw and label 5 objects in French."
                </span>
              </div>
            </div>
          </div>

          {/* Materials and Assessment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Materials Needed
              </label>
              <textarea
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                placeholder="List materials, one per line"
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Assessment Notes
              </label>
              <textarea
                value={formData.assessmentNotes}
                onChange={(e) => handleInputChange('assessmentNotes', e.target.value)}
                placeholder="How will you assess student learning?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Differentiation Strategies */}
          <div style={{ 
            marginBottom: '30px',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f0fdf4'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#059669', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎯 Differentiation Strategies
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#10b981',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                INCLUSIVE
              </span>
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              marginBottom: '16px',
              fontStyle: 'italic'
            }}>
              Support all learners by planning differentiated approaches
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '5px' 
                }}>
                  For Struggling Learners
                </label>
                <textarea
                  value={formData.differentiationStrategies.forStruggling}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    differentiationStrategies: {
                      ...prev.differentiationStrategies,
                      forStruggling: e.target.value
                    }
                  }))}
                  placeholder="How will you support students who need extra help?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '5px' 
                }}>
                  For Advanced Learners
                </label>
                <textarea
                  value={formData.differentiationStrategies.forAdvanced}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    differentiationStrategies: {
                      ...prev.differentiationStrategies,
                      forAdvanced: e.target.value
                    }
                  }))}
                  placeholder="How will you challenge students ready for more?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '5px' 
                }}>
                  For ELL Students
                </label>
                <textarea
                  value={formData.differentiationStrategies.forELL}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    differentiationStrategies: {
                      ...prev.differentiationStrategies,
                      forELL: e.target.value
                    }
                  }))}
                  placeholder="Language supports for English Language Learners"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '5px' 
                }}>
                  IEP Accommodations
                </label>
                <textarea
                  value={formData.differentiationStrategies.forIEP}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    differentiationStrategies: {
                      ...prev.differentiationStrategies,
                      forIEP: e.target.value
                    }
                  }))}
                  placeholder="Specific accommodations for students with IEPs"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#374151' }}>
              <input
                type="checkbox"
                checked={formData.isSubFriendly}
                onChange={(e) => handleInputChange('isSubFriendly', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Make this lesson substitute teacher friendly
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/planner/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.unitPlanId}
              style={{
                padding: '10px 20px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Quick Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
