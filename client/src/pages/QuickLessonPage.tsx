
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function QuickLessonPage(): React.ReactElement {
  const navigate = useNavigate();

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
          ⚡ Quick Lesson Planner
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#059669', fontSize: '24px', marginBottom: '15px' }}>
            ✨ Aide intelligente pour Grade 1 French Immersion
          </h2>
          <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.6' }}>
            Perfect for emergency planning, substitute teacher lessons, or one-off activities for Emily's Grade 1 French Immersion class at West Kent Elementary, PEI.
          </p>
          <button
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/planner/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400e', fontSize: '22px', marginBottom: '10px' }}>
            🚧 Quick Lesson Form Coming Soon
          </h3>
          <p style={{ color: '#92400e', fontSize: '16px' }}>
            This feature is being developed. For now, Emily can use the dashboard to access long-range planning and calendar views.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export removed - already has named export above
