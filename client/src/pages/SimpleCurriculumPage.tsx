import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/subjects';
import { useCurriculumExpectations } from '../hooks/useETFOPlanning';
import { safeJsonParse } from '../utils/typeGuards';

// Grade 1 French Immersion curriculum expectations for PEI
export function SimpleCurriculumPage(): React.ReactElement {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Show 15 expectations per page
  
  // Get teacher's selected subjects from localStorage
  const teacherSubjects = useMemo(() => {
    const storedSubjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
    return storedSubjects ? safeJsonParse<string[]>(storedSubjects, []) : null;
  }, []);
  
  // Fetch all curriculum expectations for Grade 1
  const { data: allExpectations = [], isLoading, error } = useCurriculumExpectations({
    grade: 1
  });
  
  // Filter expectations based on teacher's selected subjects
  const teacherFilteredExpectations = useMemo(() => {
    if (!teacherSubjects || teacherSubjects.length === 0) {
      return allExpectations; // Show all if no subjects selected
    }
    return allExpectations.filter(exp => teacherSubjects.includes(exp.subject));
  }, [allExpectations, teacherSubjects]);
  
  // Filter expectations by selected subject AND search query
  let filteredExpectations = selectedSubject === 'all' ? 
    teacherFilteredExpectations : 
    teacherFilteredExpectations.filter(exp => exp.subject === selectedSubject);
  
  // Apply search filter (optimized)
  if (searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase();
    filteredExpectations = filteredExpectations.filter(exp => 
      exp.code.toLowerCase().includes(searchLower) ||
      exp.description.toLowerCase().includes(searchLower) ||
      exp.strand.toLowerCase().includes(searchLower) ||
      (exp.substrand && exp.substrand.toLowerCase().includes(searchLower))
    );
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredExpectations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const curriculumExpectations = filteredExpectations.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, searchQuery]);
  
  // Get unique subjects for filtering (only show teacher's selected subjects)
  const subjects = useMemo(() => {
    const allSubjects = Array.from(new Set(teacherFilteredExpectations.map(exp => exp.subject))).sort();
    return allSubjects;
  }, [teacherFilteredExpectations]);

  const subjectGroups = curriculumExpectations.reduce((groups, expectation) => {
    const subject = expectation.subject;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(expectation);
    return groups;
  }, {} as Record<string, typeof curriculumExpectations>);

  if (isLoading) {
    return (
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading curriculum expectations...</div>
        <div style={{ color: '#6b7280', marginBottom: '24px' }}>Please wait while we fetch the Grade 1 French Immersion curriculum data.</div>
        
        {/* Enhanced loading with helpful info for teachers */}
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px', 
          padding: '16px', 
          marginTop: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>🎯 While you wait - Grade 1 French Immersion Overview:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
            <li><strong>Communication orale:</strong> Students develop listening and speaking skills in French</li>
            <li><strong>Lecture et visionnement:</strong> Introduction to French reading and media literacy</li>
            <li><strong>Écriture et représentation:</strong> Beginning French writing and creative expression</li>
            <li><strong>Cross-curricular connections:</strong> French integrated with math, science, and social studies</li>
            <li><strong>Cultural connections:</strong> Acadian heritage and PEI French-speaking communities</li>
          </ul>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
            💡 <strong>New Teacher Tip:</strong> Grade 1 French Immersion focuses on oral communication and cultural connections. Students at this age learn through play, songs, and hands-on activities entirely in French.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '16px', color: '#dc2626' }}>Error loading curriculum</div>
        <div style={{ color: '#6b7280', marginBottom: '24px' }}>Please try refreshing the page or contact support.</div>
        
        {/* Helpful fallback content for teachers */}
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px', 
          padding: '20px', 
          marginTop: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>📋 Grade 1 French Immersion Planning Can Continue</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>Key Areas to Plan For:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li><strong>Communication orale (CO):</strong> Listening, speaking, oral presentations</li>
              <li><strong>Lecture et visionnement (LV):</strong> Reading skills, media literacy</li>
              <li><strong>Écriture et représentation (ER):</strong> Writing, creative expression</li>
            </ul>
          </div>
          
          <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '6px', marginTop: '16px' }}>
            <strong>💡 Quick Planning Tip:</strong> While we fix the curriculum loading, you can start with basic Grade 1 French themes like "Tout sur moi" (All About Me), "Les couleurs" (Colors), "Ma famille" (My Family), and "Les saisons" (Seasons). These cover core vocabulary and cultural connections appropriate for 6-year-olds.
          </div>
          
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Try Reloading Curriculum
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Curriculum Expectations
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '18px'
          }}>
            Grade 1 French Immersion - Prince Edward Island Curriculum ({teacherFilteredExpectations.length} {teacherSubjects ? 'selected' : 'total'} expectations)
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
          title="Print this page"
        >
          🖨️ Print
        </button>
      </div>

      {/* Subject Selection Alert */}
      {teacherSubjects === null || teacherSubjects.length === 0 ? (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#dc2626',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            ⚠️ No subjects selected!
          </div>
          <p style={{
            color: '#dc2626',
            fontSize: '14px',
            margin: '0 0 12px 0'
          }}>
            Please use the Getting Started Guide on the dashboard to select which subjects you teach.
            Without subject selection, you won't be able to plan your curriculum effectively.
          </p>
          <Link to="/planner/dashboard" style={{
            display: 'inline-block',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Go to Dashboard
          </Link>
        </div>
      ) : teacherSubjects && teacherSubjects.length > 0 ? (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1d4ed8',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            📚 Your Selected Subjects
          </div>
          <p style={{
            color: '#1d4ed8',
            fontSize: '14px',
            margin: '0'
          }}>
            Showing curriculum expectations for: {teacherSubjects.join(', ')}. 
            To change your subject selection, use the Getting Started Guide on the dashboard.
          </p>
        </div>
      ) : null}

      {/* Filters and Search */}
      <div style={{ 
        marginBottom: '32px', 
        padding: '20px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Subject Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Filter by Subject:
            </label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ 
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                backgroundColor: 'white',
                width: '100%'
              }}
            >
              <option value="all">All Subjects ({teacherFilteredExpectations.length} expectations)</option>
              {subjects.map(subject => {
                const count = teacherFilteredExpectations.filter(exp => exp.subject === subject).length;
                return (
                  <option key={subject} value={subject}>
                    {subject} ({count} expectations)
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Search Box */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              🔍 Search Expectations:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, description, or strand..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            />
          </div>
        </div>
        
        {/* Results Summary */}
        {(searchQuery || selectedSubject !== 'all') && (
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            backgroundColor: '#e0f2fe',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            Showing {filteredExpectations.length} expectation{filteredExpectations.length !== 1 ? 's' : ''} 
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedSubject !== 'all' && ` in ${selectedSubject}`}
          </div>
        )}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '32px',
          marginBottom: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === pageNum ? '#4f46e5' : 'white',
                    color: currentPage === pageNum ? 'white' : '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minWidth: '40px'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
        </div>
      )}

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
                <option value="Français (Immersion)">Français (Immersion)</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Sciences de la nature">Sciences de la nature</option>
                <option value="Sciences humaines">Sciences humaines</option>
                <option value="Arts visuels">Arts visuels</option>
                <option value="Musique">Musique</option>
                <option value="Éducation physique">Éducation physique</option>
                <option value="Formation personnelle et sociale">Formation personnelle et sociale</option>
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