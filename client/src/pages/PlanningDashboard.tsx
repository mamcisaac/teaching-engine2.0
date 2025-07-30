import React from 'react';
import { useNavigate } from 'react-router-dom';

export function PlanningDashboard(): React.ReactElement {
  console.log('[PlanningDashboard] Component rendering...');
  const navigate = useNavigate();
  
  const handleNavigateToLongRange = (): void => {
    console.log('[PlanningDashboard] Navigating to long-range planning');
    navigate('/planner/long-range');
  };

  const handleNavigateToCalendar = (): void => {
    console.log('[PlanningDashboard] Navigating to calendar view');
    navigate('/planner/calendar');
  };

  const handleNavigateToQuickLesson = (): void => {
    console.log('[PlanningDashboard] Navigating to quick lesson');
    navigate('/planner/quick-lesson');
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
            👋 Bienvenue, Emily McIsaac!
          </h2>
          <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.6' }}>
            Welcome to your Grade 1 French Immersion planning dashboard. You are successfully 
            logged in and ready to create amazing lesson plans for your students at West Kent Elementary, PEI.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
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
              📚 Commencer la planification
            </h3>
            <p style={{ color: '#1e40af' }}>
              Create your first lesson plan for Grade 1 French Immersion
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
