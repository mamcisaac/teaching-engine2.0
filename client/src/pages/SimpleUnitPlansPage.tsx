import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnitPlans, useCreateUnitPlan, useUpdateUnitPlan, useDeleteUnitPlan, useLongRangePlan, type UnitPlan } from '../hooks/useETFOPlanning';
import { toast } from 'sonner';

export function SimpleUnitPlansPage(): React.ReactElement {
  const { longRangePlanId, unitId } = useParams<{ longRangePlanId?: string; unitId?: string }>();
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

  // Connect to comprehensive database - this will show the correct units for each subject
  // Mathematics will show 8 math units, French will show 8 French units, etc.
  const { data: longRangePlan } = useLongRangePlan(longRangePlanId);
  const { data: units, isLoading, error } = useUnitPlans(longRangePlanId);

  // Mutations
  const createMutation = useCreateUnitPlan();
  const updateMutation = useUpdateUnitPlan();
  const deleteMutation = useDeleteUnitPlan();

  const handleCreateUnit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        ...formData,
        longRangePlanId: longRangePlanId || 'default',
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
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Unit Plans
          </h1>
          {longRangePlan && (
            <p style={{ 
              fontSize: '18px', 
              color: '#6b7280' 
            }}>
              {longRangePlan.subject} • Grade {longRangePlan.grade}
            </p>
          )}
        </div>
      </div>

      {/* Unit Plans Grid */}
      {units && units.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px' 
        }}>
          {units.map((unit) => (
            <div 
              key={unit.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e5e7eb'
              }}
              onClick={() => handleUnitClick(unit.id)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {unit.title}
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                {unit.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280' 
                }}>
                  {new Date(unit.startDate).toLocaleDateString()} - {new Date(unit.endDate).toLocaleDateString()}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#dbeafe', 
                  color: '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {unit.estimatedHours}h
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4f46e5',
                  fontWeight: '500'
                }}>
                  {unit._count?.lessonPlans || 0} lessons
                </span>
                
                <div style={{ 
                  fontSize: '24px',
                  color: '#9ca3af'
                }}>
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            No unit plans yet
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '24px' }}>
            Unit plans for this subject will appear here as they're created.
          </p>
        </div>
      )}
    </div>
  );
}