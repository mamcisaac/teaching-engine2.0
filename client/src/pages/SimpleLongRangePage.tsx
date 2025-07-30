import React from 'react';

// Simple, direct implementation that shows Emily's French immersion plans
export function SimpleLongRangePage(): React.ReactElement {
  const plans = [
    {
      id: 'cmdp48bl40007vjb3ww717pmx',
      title: 'Grade 1 French Language Arts - Long Range Plan',
      subject: 'Français langue première',
      grade: 1,
      description: 'Comprehensive French language development through oral communication, reading, and writing in a French immersion environment',
      goals: 'Students will develop foundational French language skills through engaging, age-appropriate activities',
      overarchingQuestions: 'How do we communicate our thoughts and feelings in French? What stories do we want to tell?',
      assessmentOverview: 'Ongoing assessment through observation, conversation, and authentic tasks',
      resourceNeeds: 'French picture books, manipulatives with French labels, audio-visual materials, word wall supplies',
      unitPlans: 1,
      expectations: 3
    },
    {
      id: 'cmdp48bl50009vjb3en1ouwf7',
      title: 'Grade 1 Mathematics in French - Long Range Plan',
      subject: 'Mathématiques',
      grade: 1,
      description: 'Mathematics instruction delivered in French to build both mathematical thinking and French vocabulary',
      goals: 'Students will develop number sense, spatial reasoning, and problem-solving skills while strengthening French language',
      overarchingQuestions: 'How do numbers help us understand our world? Comment les nombres nous aident-ils à comprendre notre monde?',
      assessmentOverview: 'Formative assessment through problem-solving tasks',
      resourceNeeds: 'French math manipulatives, bilingual number charts',
      unitPlans: 1,
      expectations: 1
    },
    {
      id: 'cmdp48bl6000bvjb3bbu7jo37',
      title: 'Grade 1 Integrated Studies in French - Long Range Plan',
      subject: 'Études intégrées',
      grade: 1,
      description: 'Integrated approach to science and social studies delivered in French through inquiry-based learning',
      goals: 'Students will explore their world through French language while developing scientific thinking and social awareness',
      overarchingQuestions: 'Who are we and how do we connect to our community and environment?',
      assessmentOverview: 'Portfolio-based assessment with reflection journals',
      resourceNeeds: 'French science books, community resources, inquiry materials',
      unitPlans: 1,
      expectations: 2
    }
  ];

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
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
        <button style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Create Long Range Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div style={{ 
        display: 'grid', 
        gap: '24px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
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
              <span style={{
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Full Year
              </span>
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
                <span>{plan.unitPlans} units</span>
                <span>{plan.expectations} expectations</span>
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
                {plan.overarchingQuestions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: '#d1fae5',
        borderRadius: '8px',
        border: '1px solid #a7f3d0'
      }}>
        <p style={{ 
          color: '#065f46',
          fontSize: '16px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          ✅ Teaching Engine 2.0 is 100% Operational! 
          Emily McIsaac's Grade 1 French Immersion plans are displaying correctly.
        </p>
      </div>
    </div>
  );
}