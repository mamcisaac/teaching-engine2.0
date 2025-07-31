
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
    isSubFriendly: false
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
        isSubFriendly: formData.isSubFriendly
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
        isSubFriendly: false
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
        
        <div style={{ marginBottom: '30px' }}>
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
          </div>

          {/* Three-Part Lesson Structure */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
              Three-Part Lesson Structure
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Minds-On (Hook/Introduction)
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
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Action (Main Learning Activities)
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
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Consolidation (Wrap-up/Assessment)
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
