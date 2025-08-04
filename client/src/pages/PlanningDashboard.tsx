import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants/subjects';
import { useCurriculumExpectations } from '../hooks/useETFOPlanning';
import { safeJsonParse } from '../utils/typeGuards';

export function PlanningDashboard(): React.ReactElement {
  // console.log('[PlanningDashboard] Component rendering...');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get curriculum data to show coverage
  const { data: expectations = [] } = useCurriculumExpectations({ grade: 1 });
  
  // Get teacher's selected subjects
  const teacherSubjects = useMemo(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
    return safeJsonParse<string[]>(stored, []);
  }, []);
  
  // Calculate curriculum coverage
  const curriculumStats = useMemo(() => {
    const stats: Record<string, { total: number; covered: number }> = {};
    
    expectations.forEach(exp => {
      if (!teacherSubjects.length || teacherSubjects.includes(exp.subject)) {
        if (!stats[exp.subject]) {
          stats[exp.subject] = { total: 0, covered: 0 };
        }
        stats[exp.subject].total++;
        if (exp.coverage && exp.coverage.percentage > 0) {
          stats[exp.subject].covered++;
        }
      }
    });
    
    return stats;
  }, [expectations, teacherSubjects]);
  
  const handleNavigateToLongRange = (): void => {
    // console.log('[PlanningDashboard] Navigating to long-range planning');
    navigate('/planner/long-range');
  };

  const handleNavigateToCalendar = (): void => {
    // console.log('[PlanningDashboard] Navigating to calendar view');
    navigate('/planner/calendar');
  };

  const handleNavigateToQuickLesson = (): void => {
    // console.log('[PlanningDashboard] Navigating to quick lesson');
    navigate('/planner/quick-lesson');
  };

  const handleNavigateToCurriculum = (): void => {
    // console.log('[PlanningDashboard] Navigating to curriculum');
    navigate('/curriculum');
  };

  const handleNavigateToUnits = (): void => {
    // console.log('[PlanningDashboard] Navigating to unit plans');
    navigate('/planner/units');
  };

  const handleNavigateToDaybook = (): void => {
    // console.log('[PlanningDashboard] Navigating to daybook');
    navigate('/planner/daybook');
  };

  const handleNavigateToTemplates = (): void => {
    // console.log('[PlanningDashboard] Navigating to templates');
    navigate('/templates');
  };

  const handleRestartOnboarding = (): void => {
    // console.log('[PlanningDashboard] Restarting onboarding tour');
    localStorage.setItem('onboarded', 'false');
    window.location.reload(); // Reload to trigger onboarding
  };

  const cardStyle = {
    cursor: 'pointer' as const,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  };

  const hoverStyle = {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    }
  };
  
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1e40af', 
          textAlign: 'center', 
          marginBottom: '20px' 
        }}>
          🎉 Teaching Engine 2.0 Dashboard
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#059669', fontSize: '24px', marginBottom: '15px' }}>
            👋 Bienvenue, {user?.name || 'Teacher'}!
          </h2>
          <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.6' }}>
            Welcome to your Grade 1 French Immersion planning dashboard. You are successfully 
            logged in and ready to create amazing lesson plans for your students in PEI.
          </p>
        </div>

        {/* Subject Selection Status */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                📚 My Teaching Subjects
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {(() => {
                  const subjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
                  const parsed = safeJsonParse<string[]>(subjects, []);
                  return parsed.length > 0 ? parsed.join(', ') : 'No subjects selected - click to set up';
                })()}
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Do you want to update your subject selection? This will restart the onboarding process.')) {
                  localStorage.removeItem(STORAGE_KEYS.TEACHER_SUBJECTS);
                  handleRestartOnboarding();
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Update Subjects
            </button>
          </div>
        </div>

        {/* Curriculum Coverage Section */}
        {Object.keys(curriculumStats).length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
              📊 Curriculum Coverage Progress
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px'
            }}>
              {Object.entries(curriculumStats).map(([subject, stats]) => {
                const percentage = stats.total > 0 ? Math.round((stats.covered / stats.total) * 100) : 0;
                const color = percentage === 100 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#ef4444';
                
                return (
                  <div key={subject} style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      {subject}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {stats.covered}/{stats.total} expectations planned
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: color, marginTop: '4px', fontWeight: '600' }}>
                      {percentage}% covered
                    </div>
                  </div>
                );
              })}
            </div>
            {Object.values(curriculumStats).some(stats => stats.covered < stats.total) && (
              <p style={{ 
                fontSize: '13px', 
                color: '#6b7280', 
                marginTop: '15px',
                fontStyle: 'italic'
              }}>
                💡 Tip: Create lesson plans to increase your curriculum coverage!
              </p>
            )}
          </div>
        )}

        {/* Quick Actions Section */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '10px'
          }}>
            <button
              onClick={handleNavigateToQuickLesson}
              style={{
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              ✨ Create Today's Lesson
            </button>
            
            <button
              onClick={handleNavigateToUnits}
              style={{
                padding: '12px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              📚 View Unit Plans
            </button>
            
            <button
              onClick={handleNavigateToDaybook}
              style={{
                padding: '12px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              📖 Daily Reflections
            </button>
            
            <button
              onClick={handleNavigateToTemplates}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            >
              📋 Use Templates
            </button>
            
            <button
              onClick={handleRestartOnboarding}
              style={{
                padding: '12px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            >
              🎯 Getting Started Guide
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div 
            style={{ 
              backgroundColor: '#f0fdf4', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '2px solid #16a34a',
              ...cardStyle
            }}
            onClick={handleNavigateToCurriculum}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigateToCurriculum();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <h3 style={{ color: '#166534', fontSize: '20px', marginBottom: '10px' }}>
              📋 Curriculum Expectations
            </h3>
            <p style={{ color: '#166534' }}>
              Review Grade 1 French Immersion curriculum for PEI
            </p>
          </div>

          <div 
            style={{ 
              backgroundColor: '#dbeafe', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '2px solid #3b82f6',
              ...cardStyle
            }}
            onClick={handleNavigateToLongRange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigateToLongRange();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <h3 style={{ color: '#1e40af', fontSize: '20px', marginBottom: '10px' }}>
              📚 Long Range Plans
            </h3>
            <p style={{ color: '#1e40af' }}>
              View your yearly planning for Grade 1 French Immersion
            </p>
          </div>

          <div 
            style={{ 
              backgroundColor: '#dcfce7', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '2px solid #16a34a',
              ...cardStyle
            }}
            onClick={handleNavigateToCalendar}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigateToCalendar();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <h3 style={{ color: '#166534', fontSize: '20px', marginBottom: '10px' }}>
              📅 Vue hebdomadaire
            </h3>
            <p style={{ color: '#166534' }}>
              See your week at a glance and plan ahead
            </p>
          </div>

          <div 
            style={{ 
              backgroundColor: '#faf5ff', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '2px solid #a855f7',
              ...cardStyle
            }}
            onClick={handleNavigateToQuickLesson}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigateToQuickLesson();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <h3 style={{ color: '#7c2d12', fontSize: '20px', marginBottom: '10px' }}>
              ✨ Aide intelligente
            </h3>
            <p style={{ color: '#7c2d12' }}>
              Get French Immersion lesson suggestions
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400e', fontSize: '22px', marginBottom: '10px' }}>
            🍁 Made for Prince Edward Island Educators
          </h3>
          <p style={{ color: '#92400e', fontSize: '16px' }}>
            Teaching Engine 2.0 is designed specifically for PEI curriculum requirements and 
            French Immersion pedagogy. Focus on teaching while we handle the planning complexity.
          </p>
        </div>
      </div>
    </div>
  );
}
