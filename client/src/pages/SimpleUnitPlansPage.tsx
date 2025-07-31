import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnitPlans, useCreateUnitPlan, useUpdateUnitPlan, useDeleteUnitPlan, useLongRangePlan, type UnitPlan } from '../hooks/useETFOPlanning';
import { toast } from 'sonner';

export function SimpleUnitPlansPage(): React.ReactElement {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitPlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bigIdeas: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 20,
    assessmentPlan: '',
    crossCurricularConnections: '',
    indigenousPerspectives: '',
    technologyIntegration: '',
  });

  // Fetch long range plan details
  const { data: longRangePlan } = useLongRangePlan(planId || '');

  // Fetch unit plans for this long range plan
  const { data: units = [], isLoading, error } = useUnitPlans({
    longRangePlanId: planId,
  });

  // Mutations
  const createMutation = useCreateUnitPlan();
  const updateMutation = useUpdateUnitPlan();
  const deleteMutation = useDeleteUnitPlan();

  const handleCreateUnit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!planId) return;
    
    try {
      await createMutation.mutateAsync({
        ...formData,
        longRangePlanId: planId,
      });
      toast.success('Unit plan created successfully!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create unit plan');
    }
  };

  const handleEditUnit = (unit: UnitPlan): void => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      description: unit.description || '',
      bigIdeas: unit.bigIdeas || '',
      startDate: unit.startDate.split('T')[0],
      endDate: unit.endDate.split('T')[0],
      estimatedHours: unit.estimatedHours || 20,
      assessmentPlan: unit.assessmentPlan || '',
      crossCurricularConnections: unit.crossCurricularConnections || '',
      indigenousPerspectives: unit.indigenousPerspectives || '',
      technologyIntegration: unit.technologyIntegration || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUnit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingUnit) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingUnit.id,
        ...formData,
      });
      toast.success('Unit plan updated successfully!');
      setShowEditModal(false);
      setEditingUnit(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update unit plan');
    }
  };

  const handleDeleteUnit = async (unitId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this unit plan? This will also delete all associated lesson plans.')) {
      try {
        await deleteMutation.mutateAsync(unitId);
        toast.success('Unit plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete unit plan');
      }
    }
  };

  const handleUnitClick = (unitId: string): void => {
    navigate(`/planner/units/${unitId}/lessons`);
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      description: '',
      bigIdeas: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 20,
      assessmentPlan: '',
      crossCurricularConnections: '',
      indigenousPerspectives: '',
      technologyIntegration: '',
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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading unit plans...</div>
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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Error loading unit plans</div>
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
        <span style={{ color: '#1f2937', fontWeight: '500' }}>
          {longRangePlan?.title || 'Unit Plans'}
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
          Unit Plans
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '18px'
        }}>
          {longRangePlan?.subject} - Grade {longRangePlan?.grade}
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
          {units.length} unit{units.length !== 1 ? 's' : ''} planned
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
          Create Unit Plan
        </button>
      </div>

      {/* Units Grid */}
      {units.length === 0 ? (
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
            No unit plans yet
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#9ca3af', 
            marginBottom: '24px' 
          }}>
            Create your first unit plan to organize your teaching into manageable units
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
            Create Your First Unit
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '24px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {units.map((unit) => {
            const startDate = new Date(unit.startDate);
            const endDate = new Date(unit.endDate);
            const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
            
            return (
              <div 
                key={unit.id} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onClick={() => handleUnitClick(unit.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleUnitClick(unit.id);
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
                      {unit.title}
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {duration} week{duration !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  minHeight: '42px'
                }}>
                  {unit.description || 'No description provided'}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    <span>{unit._count?.lessonPlans || 0} lessons</span>
                    <span>{unit.estimatedHours || 0} hours</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUnit(unit);
                      }}
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Edit unit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUnit(unit.id);
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
                      title="Delete unit"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Big Ideas Preview */}
                {unit.bigIdeas && (
                  <div style={{ 
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '6px',
                    borderLeft: '4px solid #22c55e'
                  }}>
                    <p style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#166534',
                      marginBottom: '4px'
                    }}>
                      Big Ideas:
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#166534',
                      lineHeight: '1.4'
                    }}>
                      {unit.bigIdeas}
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                {(unit._count?.lessonPlans ?? 0) > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      <span>Progress</span>
                      <span>{unit.progress?.percentage || 0}%</span>
                    </div>
                    <div style={{ 
                      backgroundColor: '#e5e7eb', 
                      height: '8px', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        backgroundColor: '#22c55e', 
                        height: '100%', 
                        width: `${unit.progress?.percentage || 0}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Unit Modal */}
      {showCreateModal && (
        <UnitFormModal
          title="Create Unit Plan"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateUnit}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Edit Unit Modal */}
      {showEditModal && (
        <UnitFormModal
          title="Edit Unit Plan"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateUnit}
          onCancel={() => {
            setShowEditModal(false);
            setEditingUnit(null);
            resetForm();
          }}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Reusable form modal component
function UnitFormModal({ 
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
                placeholder="e.g., Introduction to Numbers"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
            </div>

            <div>
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
                placeholder="Brief overview of what students will learn in this unit..."
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Big Ideas
              </label>
              <textarea
                value={formData.bigIdeas}
                onChange={(e) => setFormData({ ...formData, bigIdeas: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Key concepts and enduring understandings..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500' 
                }}>
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                  min="1"
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
                  Assessment Plan
                </label>
                <input
                  type="text"
                  value={formData.assessmentPlan}
                  onChange={(e) => setFormData({ ...formData, assessmentPlan: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                  placeholder="How will student learning be assessed?"
                />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Cross-Curricular Connections
              </label>
              <textarea
                value={formData.crossCurricularConnections}
                onChange={(e) => setFormData({ ...formData, crossCurricularConnections: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Connections to other subject areas..."
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Indigenous Perspectives
              </label>
              <textarea
                value={formData.indigenousPerspectives}
                onChange={(e) => setFormData({ ...formData, indigenousPerspectives: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="How will Indigenous perspectives be incorporated?"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Technology Integration
              </label>
              <textarea
                value={formData.technologyIntegration}
                onChange={(e) => setFormData({ ...formData, technologyIntegration: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="How will technology enhance learning?"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Unit Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}