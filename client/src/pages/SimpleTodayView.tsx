import { format, isToday } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Star,
  Users,
  Target,
  Package
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useETFOLessonPlans } from '../hooks/useETFOPlanning';

// Helper function to format time from date
function formatLessonTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function SimpleTodayView(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get date from URL parameter or use today as default
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const today = selectedDate; // Use selected date as "today" for this view
  
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  
  // School year dates
  const schoolStartDate = new Date('2025-09-04');
  const schoolEndDate = new Date('2026-06-26');
  const isSchoolYear = today >= schoolStartDate && today <= schoolEndDate;
  
  // Check for specific breaks
  const isChristmasBreak = (today >= new Date('2025-12-22') && today <= new Date('2026-01-04'));
  const isMarchBreak = (today >= new Date('2026-03-09') && today <= new Date('2026-03-13'));
  const isSummerVacation = today < schoolStartDate || today > schoolEndDate;
  
  // Check for PD days
  const dateStr = format(today, 'yyyy-MM-dd');
  const pdDays = [
    '2025-09-02', '2025-09-03', '2025-10-17', '2025-11-07', 
    '2026-01-30', '2026-02-13', '2026-04-24', '2026-05-22', '2026-06-05'
  ];
  const isPDDay = pdDays.includes(dateStr);
  
  // Fetch lessons from database for the selected date
  const { data: lessonData, isLoading: lessonsLoading } = useETFOLessonPlans({
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd')
  });
  
  const todayLessons = lessonData || [];
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  
  const totalTeachingTime = todayLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const subjects = [...new Set(todayLessons.map(l => l.unitPlan?.longRangePlan?.subject || 'Unknown'))];

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px'
    }}>
      {/* Navigation Links */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
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
        
        {dateParam && (
          <a 
            href="/planner/calendar" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#059669',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Back to Calendar
          </a>
        )}
      </div>

      {/* Header */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Calendar style={{ color: '#4f46e5' }} />
              {dateParam ? 'Daily Teaching View' : 'Today\'s Teaching'}
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
              {todayLessons.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Lessons Today
            </div>
          </div>
        </div>
      </div>

      {/* Summer Vacation Message */}
      {isSummerVacation && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>☀️</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e', marginBottom: '12px' }}>
            Summer Vacation!
          </h2>
          <p style={{ fontSize: '18px', color: '#78350f', marginBottom: '8px' }}>
            School is out for the summer. Enjoy your break!
          </p>
          <p style={{ fontSize: '16px', color: '#92400e' }}>
            {today < schoolStartDate 
              ? `School starts on ${format(schoolStartDate, 'MMMM d, yyyy')}`
              : `The 2025-2026 school year has ended. See you next year!`
            }
          </p>
          <button
            onClick={() => navigate('/planner/week')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            View School Calendar
          </button>
        </div>
      )}
      
      {/* Christmas Break Message */}
      {isChristmasBreak && (
        <div style={{
          backgroundColor: '#dbeafe',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎄</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px' }}>
            Christmas Break!
          </h2>
          <p style={{ fontSize: '18px', color: '#1e3a8a' }}>
            Enjoy your holiday break! School resumes January 5, 2026.
          </p>
        </div>
      )}
      
      {/* March Break Message */}
      {isMarchBreak && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46', marginBottom: '12px' }}>
            March Break!
          </h2>
          <p style={{ fontSize: '18px', color: '#064e3b' }}>
            Enjoy your spring break! School resumes March 16, 2026.
          </p>
        </div>
      )}
      
      {/* PD Day Message */}
      {isPDDay && !isSummerVacation && (
        <div style={{
          backgroundColor: '#e9d5ff',
          border: '2px solid #9333ea',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#6b21a8', marginBottom: '12px' }}>
            Professional Development Day
          </h2>
          <p style={{ fontSize: '18px', color: '#581c87' }}>
            No classes today - teachers are learning!
          </p>
        </div>
      )}

      {/* Quick Stats */}
      {!isWeekend && !isSummerVacation && !isChristmasBreak && !isMarchBreak && !isPDDay && todayLessons.length > 0 && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Clock style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Teaching Time</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {totalTeachingTime} min
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Subjects</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {subjects.length}
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Target style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>First Lesson</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
              9:00 AM
            </div>
          </div>
        </div>
      )}

      {/* Weekend Message */}
      {isWeekend && !isSummerVacation && !isChristmasBreak && !isMarchBreak && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <Star style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>
            It's the Weekend!
          </h2>
          <p style={{ fontSize: '16px', color: '#78350f' }}>
            No lessons scheduled for today. Enjoy your time off!
          </p>
          <button
            onClick={() => navigate('/planner/week')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            View Week Schedule
          </button>
        </div>
      )}

      {/* Today's Lessons */}
      {!isWeekend && !isSummerVacation && !isChristmasBreak && !isMarchBreak && !isPDDay && todayLessons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {todayLessons.map((lesson) => (
            <div 
              key={lesson.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Lesson Header */}
              <div 
                style={{
                  padding: '20px',
                  borderBottom: expandedLesson === lesson.id ? '1px solid #e5e7eb' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {formatLessonTime(new Date(lesson.date))}
                      </span>
                      <span style={{
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        {lesson.duration} min
                      </span>
                    </div>
                    <h3 style={{ 
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {lesson.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      {lesson.unitPlan?.longRangePlan?.subject || 'Unknown Subject'} • {lesson.unitPlan?.title || 'No Unit'}
                    </p>
                  </div>
                  <ChevronRight 
                    style={{ 
                      color: '#9ca3af',
                      transform: expandedLesson === lesson.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </div>
              </div>

              {/* Expanded Lesson Details */}
              {expandedLesson === lesson.id && (
                <div style={{ padding: '20px', backgroundColor: '#f9fafb' }}>
                  {/* Learning Goals */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Learning Goals
                    </h4>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>
                      {lesson.learningGoals || 'Learning goals will be added for detailed lesson plans.'}
                    </p>
                  </div>

                  {/* Three Part Lesson */}
                  <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      backgroundColor: '#fef3c7',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                        🧠 Minds On
                      </h5>
                      <p style={{ fontSize: '13px', color: '#78350f' }}>
                        {lesson.mindsOn || 'Hook activity - details to be added'}
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: '#dbeafe',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3b82f6'
                    }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                        🎯 Action
                      </h5>
                      <p style={{ fontSize: '13px', color: '#1e3a8a' }}>
                        {lesson.action || 'Main lesson activities - details to be added'}
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: '#d1fae5',
                      padding: '12px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
                        ✨ Consolidation
                      </h5>
                      <p style={{ fontSize: '13px', color: '#064e3b' }}>
                        {lesson.consolidation || 'Wrap-up and reflection - details to be added'}
                      </p>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <h4 style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      <Package style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                      Materials Needed
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(lesson.materials || ['Basic classroom materials']).map((material: string, idx: number) => (
                        <span 
                          key={idx}
                          style={{
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Lessons Message */}
      {!isWeekend && todayLessons.length === 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '2px dashed #e5e7eb',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <BookOpen style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px' }}>
            No Lessons Today
          </h2>
          <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '24px' }}>
            It might be a PD day or holiday. Check your calendar for more information.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/planner/calendar')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              View Calendar
            </button>
            <button
              onClick={() => navigate('/planner/week')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#4f46e5',
                borderRadius: '6px',
                border: '1px solid #4f46e5',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              View Week
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => navigate('/planner/week')}
            style={{
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onFocus={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onBlur={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <Calendar style={{ width: '20px', height: '20px', color: '#4f46e5', marginBottom: '4px' }} />
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>View Week</div>
          </button>
          
          <button
            onClick={() => navigate('/planner/units')}
            style={{
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onFocus={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onBlur={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <BookOpen style={{ width: '20px', height: '20px', color: '#4f46e5', marginBottom: '4px' }} />
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Unit Plans</div>
          </button>
          
          <button
            onClick={() => navigate('/planner/calendar')}
            style={{
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onFocus={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onBlur={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <Calendar style={{ width: '20px', height: '20px', color: '#4f46e5', marginBottom: '4px' }} />
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Monthly Calendar</div>
          </button>
        </div>
      </div>
    </div>
  );
}