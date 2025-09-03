import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLongRangePlans, useCreateLongRangePlan, useUpdateLongRangePlan, useDeleteLongRangePlan, type LongRangePlan } from '../hooks/useETFOPlanning';
import { toast } from 'sonner';

// Enhanced LongRangePlan type with optimization data
interface OptimizedLongRangePlan extends LongRangePlan {
  optimizationScore?: number;
  pedagogicalCertification?: string;
  lastOptimized?: string;
  researchComplianceScore?: number;
}

// Simple, direct implementation connected to real backend APIs
export function SimpleLongRangePage(): React.ReactElement {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptimizedCreateModal, setShowOptimizedCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LongRangePlan | null>(null);
  const [optimizingPlanId, setOptimizingPlanId] = useState<string | null>(null);
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

  // Optimization handlers
  const handleOptimizePlan = async (planId: string): Promise<void> => {
    setOptimizingPlanId(planId);
    try {
      const response = await fetch(`/api/long-range-plans/${planId}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize plan');
      }
      
      const result = await response.json();
      toast.success(`Plan optimized! Score: ${result.optimization_results.score}% (${result.optimization_results.certification})`);
      
      // Refresh plans to show updated optimization data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to optimize plan');
      console.error('Optimization error:', error);
    } finally {
      setOptimizingPlanId(null);
    }
  };

  const handleViewOptimizationDashboard = (): void => {
    navigate('/planner/optimization-dashboard');
  };

  // Helper functions for optimization display
  const getOptimizationBadge = (plan: OptimizedLongRangePlan) => {
    if (!plan.optimizationScore) {
      return {
        text: 'Unoptimized',
        color: '#6b7280',
        backgroundColor: '#f3f4f6'
      };
    }
    
    if (plan.optimizationScore >= 95) {
      return {
        text: `${plan.optimizationScore}% Exemplary`,
        color: '#059669',
        backgroundColor: '#d1fae5'
      };
    } else if (plan.optimizationScore >= 85) {
      return {
        text: `${plan.optimizationScore}% Optimized`,
        color: '#0891b2',
        backgroundColor: '#cffafe'
      };
    } else if (plan.optimizationScore >= 75) {
      return {
        text: `${plan.optimizationScore}% Good`,
        color: '#ca8a04',
        backgroundColor: '#fef3c7'
      };
    } else {
      return {
        text: `${plan.optimizationScore}% Needs Work`,
        color: '#dc2626',
        backgroundColor: '#fecaca'
      };
    }
  };

  const shouldShowOptimizeButton = (plan: OptimizedLongRangePlan): boolean => {
    if (!plan.optimizationScore) return true; // Never optimized
    if (plan.optimizationScore < 85) return true; // Score too low
    
    // Check if optimization is stale (90+ days old)
    if (plan.lastOptimized) {
      const lastOptimized = new Date(plan.lastOptimized);
      const now = new Date();
      const daysSinceOptimized = (now.getTime() - lastOptimized.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceOptimized > 90;
    }
    
    return false;
  };

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
          <p style={{ 
            color: '#4f46e5',
            fontSize: '14px',
            marginTop: '8px',
            fontWeight: '500'
          }}>
            ✨ Now with AI-powered pedagogical optimization using UbD, WHERETO, and research-based frameworks
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
            onClick={handleViewOptimizationDashboard}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📊 Optimization Dashboard
          </button>
          <button 
            onClick={() => setShowOptimizedCreateModal(true)}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✨ Generate Perfect Plan
          </button>
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
                
                {/* Optimization Score Badge */}
                {(() => {
                  const badge = getOptimizationBadge(plan as OptimizedLongRangePlan);
                  return (
                    <span style={{
                      backgroundColor: badge.backgroundColor,
                      color: badge.color,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: `1px solid ${badge.color}20`
                    }}>
                      {badge.text}
                    </span>
                  );
                })()}
                {/* Show Optimize button if needed */}
                {shouldShowOptimizeButton(plan as OptimizedLongRangePlan) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptimizePlan(plan.id);
                    }}
                    disabled={optimizingPlanId === plan.id}
                    style={{
                      backgroundColor: optimizingPlanId === plan.id ? '#d1d5db' : '#fbbf24',
                      color: optimizingPlanId === plan.id ? '#6b7280' : '#92400e',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '12px',
                      cursor: optimizingPlanId === plan.id ? 'not-allowed' : 'pointer',
                      marginRight: '4px'
                    }}
                    title="Optimize with AI pedagogical frameworks"
                  >
                    {optimizingPlanId === plan.id ? 'Optimizing...' : '⚡ Optimize'}
                  </button>
                )}
                
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

            {/* Optimization Insights - Show only for optimized plans */}
            {(plan as OptimizedLongRangePlan).optimizationScore && (
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                borderLeft: '4px solid #0891b2'
              }}>
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#0c4a6e',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✨ Research-Based Optimization
                  {(plan as OptimizedLongRangePlan).pedagogicalCertification && (
                    <span style={{
                      backgroundColor: (plan as OptimizedLongRangePlan).pedagogicalCertification === 'exemplary' ? '#059669' : '#0891b2',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {(plan as OptimizedLongRangePlan).pedagogicalCertification}
                    </span>
                  )}
                </p>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#164e63',
                  lineHeight: '1.3'
                }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Frameworks Applied:</strong> Understanding by Design (UbD) • WHERETO Engagement • Multi-Tiered Differentiation • Cross-Curricular Integration
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>Research Compliance:</strong> {Math.round(((plan as OptimizedLongRangePlan).researchComplianceScore || 0.85) * 100)}%
                    </span>
                    {(plan as OptimizedLongRangePlan).lastOptimized && (
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>
                        Optimized: {new Date((plan as OptimizedLongRangePlan).lastOptimized!).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
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

      {/* Generate Perfect Plan Modal */}
      {showOptimizedCreateModal && (
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
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ✨ Generate Perfect Plan
              </h2>
              <p style={{ 
                color: '#6b7280',
                fontSize: '16px',
                marginBottom: '16px'
              }}>
                AI-powered pedagogical optimization using research-based frameworks
              </p>
              <div style={{ 
                backgroundColor: '#f0f9ff',
                border: '1px solid #e0f2fe',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '14px', color: '#0c4a6e', marginBottom: '8px', fontWeight: '600' }}>
                  🎯 What makes this perfect?
                </p>
                <ul style={{ fontSize: '12px', color: '#164e63', lineHeight: '1.5', paddingLeft: '16px' }}>
                  <li><strong>Understanding by Design (UbD):</strong> Backward planning from outcomes</li>
                  <li><strong>WHERETO Framework:</strong> Comprehensive engagement planning</li>
                  <li><strong>Multi-Tiered Differentiation:</strong> Supports for all learners</li>
                  <li><strong>Data-Driven:</strong> Predictive analytics and interventions</li>
                  <li><strong>Cross-Curricular:</strong> Meaningful subject connections</li>
                  <li><strong>Cultural Responsiveness:</strong> Inclusive and family-centered</li>
                </ul>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Use optimized AI generation endpoint
                const response = await fetch('/api/long-range-plans/ai-optimized-draft', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: formData.subject,
                    grade: formData.grade,
                    academicYear: formData.academicYear,
                    expectationIds: [], // Would need to be populated from curriculum selection
                    teacherExperienceLevel: 'experienced',
                    frenchImmersionCertified: formData.subject.includes('Français'),
                    studentProfile: {
                      totalStudents: 20,
                      englishLanguageLearners: 3,
                      specialEducation: 2,
                      giftedStudents: 1,
                      culturalBackgrounds: ['French-Canadian', 'Acadian']
                    }
                  })
                });
                
                if (!response.ok) throw new Error('Failed to generate optimized plan');
                
                const optimizedDraft = await response.json();
                
                // Create the plan with optimization data
                await createMutation.mutateAsync({
                  title: formData.title || optimizedDraft.title,
                  subject: formData.subject,
                  grade: formData.grade,
                  academicYear: formData.academicYear,
                  description: optimizedDraft.description,
                  goals: optimizedDraft.goals,
                  overarchingQuestions: optimizedDraft.overarchingQuestions,
                  assessmentOverview: optimizedDraft.assessmentOverview,
                  resourceNeeds: optimizedDraft.resourceNeeds,
                  professionalGoals: optimizedDraft.professionalGoals,
                  // Optimization metadata can be stored in description or notes if needed
                });
                
                toast.success(`Perfect plan generated! Optimization Score: ${optimizedDraft.optimizationScore}% (${optimizedDraft.pedagogicalCertification})`);
                setShowOptimizedCreateModal(false);
                setFormData({
                  title: '',
                  subject: '',
                  grade: 1,
                  academicYear: '2025-2026',
                  description: '',
                  goals: '',
                });
              } catch (error) {
                toast.error('Failed to generate perfect plan');
                console.error(error);
              }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
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
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                  placeholder="e.g., Grade 1 Perfect French Language Arts Plan"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    <option value="">Select Subject</option>
                    <option value="Français (Immersion)">Français (Immersion)</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Sciences et technologie">Sciences et technologie</option>
                    <option value="Études sociales">Études sociales</option>
                    <option value="Arts">Arts</option>
                    <option value="English Language Arts">English Language Arts</option>
                    <option value="Éducation physique">Éducation physique</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Grade *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px', fontWeight: '600' }}>
                  🚀 AI will automatically generate:
                </p>
                <div style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.5' }}>
                  ✓ Year-long essential questions and enduring understandings<br/>
                  ✓ Authentic performance tasks and assessment strategies<br/>
                  ✓ Multi-tiered differentiation for all learners<br/>
                  ✓ Cross-curricular thematic connections<br/>
                  ✓ Family engagement and cultural responsiveness plan<br/>
                  ✓ Monthly implementation guides and resources<br/>
                  ✓ Research-based pedagogical optimization (Target: 95%+ score)
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  type="button"
                  onClick={() => setShowOptimizedCreateModal(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: '2px solid #d1d5db',
                    backgroundColor: 'white',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: createMutation.isPending ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {createMutation.isPending ? 'Generating Perfect Plan...' : '✨ Generate Perfect Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}