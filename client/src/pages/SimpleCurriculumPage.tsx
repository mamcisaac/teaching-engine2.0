import React from 'react';
import { Link } from 'react-router-dom';

// Grade 1 French Immersion curriculum expectations for PEI
export function SimpleCurriculumPage(): React.ReactElement {
  const curriculumExpectations = [
    {
      id: 'fl1-oral-1',
      code: 'FL1.O.1',
      subject: 'Français langue première',
      strand: 'Communication orale',
      description: 'L\'élève peut exprimer ses idées et ses sentiments de façon spontanée en français.',
      grade: 1
    },
    {
      id: 'fl1-oral-2', 
      code: 'FL1.O.2',
      subject: 'Français langue première',
      strand: 'Communication orale',
      description: 'L\'élève peut comprendre et suivre des consignes simples données en français.',
      grade: 1
    },
    {
      id: 'fl1-reading-1',
      code: 'FL1.L.1', 
      subject: 'Français langue première',
      strand: 'Lecture',
      description: 'L\'élève peut reconnaître et lire des mots familiers en français.',
      grade: 1
    },
    {
      id: 'math1-num-1',
      code: 'M1.N.1',
      subject: 'Mathématiques', 
      strand: 'Numération',
      description: 'L\'élève peut compter jusqu\'à 20 en français et reconnaître les nombres.',
      grade: 1
    },
    {
      id: 'math1-num-2',
      code: 'M1.N.2',
      subject: 'Mathématiques',
      strand: 'Numération', 
      description: 'L\'élève peut effectuer des additions simples avec des objets concrets.',
      grade: 1
    },
    {
      id: 'sci1-living-1',
      code: 'S1.V.1',
      subject: 'Sciences',
      strand: 'Êtres vivants',
      description: 'L\'élève peut identifier les besoins de base des êtres vivants en français.',
      grade: 1
    },
    {
      id: 'soc1-community-1', 
      code: 'SS1.C.1',
      subject: 'Études sociales',
      strand: 'Communauté',
      description: 'L\'élève peut décrire sa famille et sa communauté en français.',
      grade: 1
    }
  ];

  const subjectGroups = curriculumExpectations.reduce((groups, expectation) => {
    const subject = expectation.subject;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(expectation);
    return groups;
  }, {} as Record<string, typeof curriculumExpectations>);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px' 
    }}>
      {/* Breadcrumb */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '14px', 
        color: '#6b7280', 
        marginBottom: '8px' 
      }}>
        <Link to="/planner/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <span>›</span>
        <span style={{ color: '#1f2937', fontWeight: '500' }}>Curriculum Expectations</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Curriculum Expectations
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '18px'
        }}>
          Grade 1 French Immersion - Prince Edward Island Curriculum
        </p>
      </div>

      {/* Subject Sections */}
      {Object.entries(subjectGroups).map(([subject, expectations]) => (
        <div key={subject} style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            {subject}
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {expectations.map((expectation) => (
              <div key={expectation.id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {expectation.code}
                    </span>
                    <span style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {expectation.strand}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: '#ede9fe',
                    color: '#6d28d9',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Grade 1
                  </span>
                </div>
                
                <p style={{ 
                  fontSize: '16px', 
                  color: '#374151',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {expectation.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Navigation to Long Range Plans */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        border: '1px solid #86efac',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          color: '#166534', 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '12px' 
        }}>
          Ready to Plan Your Year?
        </h3>
        <p style={{ 
          color: '#166534', 
          fontSize: '16px', 
          marginBottom: '16px' 
        }}>
          Now that you've reviewed the curriculum expectations, create your long-range plans to organize your teaching year.
        </p>
        <Link to="/planner/long-range">
          <button style={{
            backgroundColor: '#166534',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            View Long-Range Plans →
          </button>
        </Link>
      </div>
    </div>
  );
}

// Reusable form modal component
function ExpectationFormModal({ 
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
                Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                placeholder="e.g., FL1.O.1"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Subject *
              </label>
              <select
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
              >
                <option value="">Select a subject</option>
                <option value="Français langue première">Français langue première</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Sciences">Sciences</option>
                <option value="Études sociales">Études sociales</option>
                <option value="Arts">Arts</option>
                <option value="Éducation physique">Éducation physique</option>
                <option value="Anglais langue seconde">Anglais langue seconde</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Strand *
              </label>
              <input
                type="text"
                value={formData.strand}
                onChange={(e) => setFormData({ ...formData, strand: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                placeholder="e.g., Communication orale"
              />
            </div>

            <div>
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

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500' 
              }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Describe what students will learn..."
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
              {isSubmitting ? 'Saving...' : 'Save Expectation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}