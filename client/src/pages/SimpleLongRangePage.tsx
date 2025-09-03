import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useLongRangePlans, useCreateLongRangePlan, useUpdateLongRangePlan, useDeleteLongRangePlan, type LongRangePlan } from '../hooks/useETFOPlanning';
// Simple, direct implementation connected to real backend APIs
export function SimpleLongRangePage(): React.ReactElement {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LongRangePlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: 1,
    academicYear: '2025-2026',
    description: '',
    goals: '',
  });

  // Connect to comprehensive database - this will show all 8 subject plans from Emily's database
  const { data: plans, isLoading, error } = useLongRangePlans();

  // Mutations
  const createMutation = useCreateLongRangePlan();
  const updateMutation = useUpdateLongRangePlan();
  const deleteMutation = useDeleteLongRangePlan();

  const handleCreatePlan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success('Long range plan created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        subject: '',
        grade: 1,
        academicYear: '2025-2026',
        description: '',
        goals: '',
      });
    } catch (error) {
      toast.error('Failed to create long range plan');
    }
  };

  const handleEditPlan = (plan: LongRangePlan): void => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      subject: plan.subject,
      grade: plan.grade,
      academicYear: plan.academicYear,
      description: plan.description || '',
      goals: plan.goals || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingPlan) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingPlan.id,
        ...formData,
      });
      toast.success('Plan updated successfully!');
      setShowEditModal(false);
      setEditingPlan(null);
      setFormData({
        title: '',
        subject: '',
        grade: 1,
        academicYear: '2025-2026',
        description: '',
        goals: '',
      });
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleDeletePlan = async (planId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteMutation.mutateAsync(planId);
        toast.success('Plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handlePlanClick = (planId: string): void => {
    console.log('[SimpleLongRangePage] Navigating to units for plan:', planId);
    navigate(`/planner/long-range/${planId}/units`);
  };

  // REMOVED: All fake optimization handlers and helper functions

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading plans...</div>
        </div>
      </div>
    );
  }

  // Show error state
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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Error loading plans</div>
          <div>{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
      
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
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
            Long-Range Planning
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '18px'
          }}>
            Plan your academic year with ETFO-aligned curriculum organization
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
          title="Print your long-range plans"
        >
          🖨️ Print Plans
        </button>
      </div>

      {/* Year Selector and Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            Academic Year:
          </label>
          <select style={{ 
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '16px'
          }}>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            Create Basic Plan
          </button>
        </div>
      </div>

      {/* Show empty state only if no plans exist */}
      {!plans || plans.length === 0 ? (
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
            No long range plans yet
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#9ca3af', 
            marginBottom: '24px' 
          }}>
            Create your first long range plan to start organizing your academic year
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
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '24px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {plans.map((plan) => (
          <div 
            key={plan.id} 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '24px',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => handlePlanClick(plan.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlanClick(plan.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {plan.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  {plan.subject} - Grade {plan.grade}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: '#ede9fe',
                  color: '#6d28d9',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {plan.term || 'Full Year'}
                </span>
                
                {/* REMOVED: Fake optimization badge and button */}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPlan(plan);
                  }}
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginRight: '4px'
                  }}
                  title="Edit plan"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlan(plan.id);
                  }}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title="Delete plan"
                >
                  Delete
                </button>
              </div>
            </div>

            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {plan.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '14px'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                color: '#6b7280' 
              }}>
                <span>{plan._count?.unitPlans || 0} units</span>
                <span>{plan._count?.expectations || 0} expectations</span>
              </div>
              <svg 
                style={{ width: '20px', height: '20px', color: '#9ca3af' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>

            {/* Goals Preview */}
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              borderLeft: '4px solid #4f46e5'
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '4px'
              }}>
                Goals:
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                {plan.goals}
              </p>
            </div>

            {/* Overarching Questions */}
            <div style={{ 
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#92400e',
                marginBottom: '4px'
              }}>
                Overarching Questions:
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#78350f',
                lineHeight: '1.4'
              }}>
                {plan.overarchingQuestions || plan.themes?.join(', ') || 'Key themes and questions will be developed'}
              </p>
            </div>

            {/* REMOVED: Fake optimization insights section */}
          </div>
        ))}
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px' 
            }}>
              Edit Long Range Plan
            </h2>
            
            <form onSubmit={handleUpdatePlan}>
              <div style={{ marginBottom: '16px' }}>
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
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                  }}
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
                  disabled={updateMutation.isPending}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: updateMutation.isPending ? '#9ca3af' : '#4f46e5',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: updateMutation.isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px' 
            }}>
              Create Long Range Plan
            </h2>
            
            <form onSubmit={handleCreatePlan}>
              <div style={{ marginBottom: '16px' }}>
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
                  placeholder="e.g., Grade 1 French Language Arts"
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Use a descriptive title that clearly identifies the subject and grade level
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Français (Immersion)"
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Enter the specific subject area (e.g., Mathématiques, Sciences, Arts)
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the focus and approach for this subject area..."
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Example: "Focus on oral communication, reading comprehension, and writing skills in French immersion context"
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="What are the main learning goals for students?"
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Example: "Develop French vocabulary, practice daily communication, build reading fluency with simple texts"
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  disabled={createMutation.isPending}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: createMutation.isPending ? '#9ca3af' : '#4f46e5',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: createMutation.isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}