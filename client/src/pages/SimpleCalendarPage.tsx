import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Settings, Clock, Coffee, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Type definitions for schedule
interface ScheduleSlot {
  type: 'arrival' | 'teaching' | 'break' | 'lunch' | 'specialist' | 'dismissal';
  title?: string;
  subject?: string;
  duration: number;
}

interface Schedule {
  [time: string]: ScheduleSlot;
}

// Default daily schedule template
const defaultSchedule: Schedule = {
  '8:30': { type: 'arrival', title: 'Arrival & Morning Routine', duration: 30 },
  '9:00': { type: 'teaching', subject: 'Français', duration: 60 },
  '10:00': { type: 'break', title: 'Recess', duration: 15 },
  '10:15': { type: 'teaching', subject: 'Mathématiques', duration: 45 },
  '11:00': { type: 'teaching', subject: 'Sciences/Social', duration: 30 },
  '11:30': { type: 'lunch', title: 'Lunch', duration: 60 },
  '12:30': { type: 'teaching', subject: 'Arts/Musique', duration: 45 },
  '1:15': { type: 'specialist', title: 'Specialist (PE/Music)', duration: 45 },
  '2:00': { type: 'teaching', subject: 'Français', duration: 30 },
  '2:30': { type: 'break', title: 'Afternoon Recess', duration: 15 },
  '2:45': { type: 'teaching', subject: 'Choice Time/Centers', duration: 30 },
  '3:15': { type: 'dismissal', title: 'Dismissal', duration: 15 }
};

export function SimpleCalendarPage(): React.ReactElement {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<Schedule>(() => {
    const saved = localStorage.getItem('teacher-schedule');
    return saved ? JSON.parse(saved) as Schedule : defaultSchedule;
  });
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get empty cells for the beginning of the month
  const startDayOfWeek = getDay(monthStart);
  const emptyCells = Array(startDayOfWeek).fill(null);
  
  // School year dates
  const schoolStartDate = new Date('2025-09-04');
  const schoolEndDate = new Date('2026-06-26');
  
  // Check if a date is a school day
  const isSchoolDay = (date: Date) => {
    const day = getDay(date);
    if (day === 0 || day === 6) return false; // Weekend
    if (date < schoolStartDate || date > schoolEndDate) return false; // Outside school year
    
    // Check for holidays/breaks
    const dateStr = format(date, 'yyyy-MM-dd');
    const holidays = [
      '2025-09-01', // Labour Day
      '2025-10-13', // Thanksgiving
      '2025-11-11', // Remembrance Day
      // Christmas Break
      ...Array.from({ length: 14 }, (_, i) => 
        format(new Date(2025, 11, 22 + i), 'yyyy-MM-dd')
      ),
      // March Break
      ...Array.from({ length: 5 }, (_, i) => 
        format(new Date(2026, 2, 9 + i), 'yyyy-MM-dd')
      ),
      '2026-04-10', // Good Friday
      '2026-04-13', // Easter Monday
      '2026-05-18', // Victoria Day
    ];
    
    const pdDays = [
      '2025-09-02', '2025-09-03', '2025-10-17', '2025-11-07', 
      '2026-01-30', '2026-02-13', '2026-04-24', '2026-05-22', '2026-06-05'
    ];
    
    return !holidays.includes(dateStr) && !pdDays.includes(dateStr);
  };
  
  const getDayType = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const pdDays = [
      '2025-09-02', '2025-09-03', '2025-10-17', '2025-11-07', 
      '2026-01-30', '2026-02-13', '2026-04-24', '2026-05-22', '2026-06-05'
    ];
    
    if (pdDays.includes(dateStr)) return 'pd';
    if (!isSchoolDay(date)) return 'holiday';
    return 'school';
  };
  
  const saveSchedule = () => {
    localStorage.setItem('teacher-schedule', JSON.stringify(customSchedule));
    setShowScheduleModal(false);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px'
    }}>
      {/* Back to Dashboard */}
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
              School Calendar
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              2025-2026 School Year
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowScheduleModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Customize Schedule
            </button>
            <button
              onClick={() => navigate('/planner/today')}
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
              Today's View
            </button>
            <button
              onClick={() => navigate('/planner/week')}
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
              Week View
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ChevronRight style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '8px'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                padding: '8px'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {/* Empty cells for start of month */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} style={{ minHeight: '80px' }} />
          ))}
          
          {/* Days of the month */}
          {days.map(day => {
            const dayType = getDayType(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            
            let backgroundColor = '#ffffff';
            let borderColor = '#e5e7eb';
            let textColor = '#1f2937';
            let label = '';
            
            if (!isCurrentMonth) {
              textColor = '#d1d5db';
            } else if (isTodayDate) {
              backgroundColor = '#ede9fe';
              borderColor = '#7c3aed';
            } else if (dayType === 'pd') {
              backgroundColor = '#fef3c7';
              borderColor = '#f59e0b';
              label = 'PD Day';
            } else if (dayType === 'holiday') {
              backgroundColor = '#fee2e2';
              borderColor = '#ef4444';
              const dayOfWeek = getDay(day);
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                backgroundColor = '#f3f4f6';
                borderColor = '#d1d5db';
              }
            } else if (dayType === 'school') {
              backgroundColor = '#d1fae5';
              borderColor = '#10b981';
            }
            
            return (
              <div
                key={day.toISOString()}
                style={{
                  minHeight: '80px',
                  backgroundColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: dayType === 'school' ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
                onClick={() => {
                  if (dayType === 'school') {
                    const dateParam = format(day, 'yyyy-MM-dd');
                    navigate(`/planner/today?date=${dateParam}`);
                  }
                }}
                onMouseOver={(e) => {
                  if (dayType === 'school') {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (dayType === 'school') {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: isTodayDate ? 'bold' : 'normal',
                  color: textColor,
                  marginBottom: '4px'
                }}>
                  {format(day, 'd')}
                </div>
                {label && isCurrentMonth && (
                  <div style={{
                    fontSize: '10px',
                    color: dayType === 'pd' ? '#92400e' : '#991b1b',
                    fontWeight: '500'
                  }}>
                    {label}
                  </div>
                )}
                {dayType === 'school' && isCurrentMonth && (
                  <div style={{
                    fontSize: '10px',
                    color: '#065f46',
                    marginTop: '4px'
                  }}>
                    📚 Teaching
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Calendar Legend
        </h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Teaching Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>PD Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Holiday/Break</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Weekend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ede9fe',
              border: '1px solid #7c3aed',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Today</span>
          </div>
        </div>
      </div>

      {/* Daily Schedule */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Your Daily Schedule
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(customSchedule).map(([time, slot]) => (
            <div
              key={time}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 
                  slot.type === 'teaching' ? '#dbeafe' :
                  slot.type === 'break' ? '#fef3c7' :
                  slot.type === 'specialist' ? '#e9d5ff' :
                  slot.type === 'lunch' ? '#d1fae5' :
                  '#f3f4f6',
                borderRadius: '6px'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                {time}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {slot.type === 'break' && <Coffee style={{ width: '16px', height: '16px', color: '#92400e' }} />}
                {slot.type === 'specialist' && <Users style={{ width: '16px', height: '16px', color: '#6b21a8' }} />}
                {slot.type === 'teaching' && <Clock style={{ width: '16px', height: '16px', color: '#1e40af' }} />}
                <span style={{ fontSize: '14px', color: '#1f2937' }}>
                  {slot.type === 'teaching' ? slot.subject : slot.title}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>
                  {slot.duration} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Customization Modal */}
      {showScheduleModal && (
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
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
              Customize Your Daily Schedule
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Set your daily teaching schedule, breaks, specialist times, and planning periods.
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Morning Recess Time:
                  </label>
                  <input
                    type="time"
                    defaultValue="10:00"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Lunch Time:
                  </label>
                  <input
                    type="time"
                    defaultValue="11:30"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Specialist Time (PE/Music/Art):
                  </label>
                  <input
                    type="time"
                    defaultValue="13:15"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Planning Period:
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}
                  >
                    <option value="none">No planning period</option>
                    <option value="morning">Morning (during specialist)</option>
                    <option value="afternoon">Afternoon (during specialist)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Preferred Subject Order:
                  </label>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: '8px' }}>
                    Drag to reorder your teaching subjects
                  </div>
                  <div style={{ display: 'grid', gap: '4px' }}>
                    {['Français (Morning)', 'Mathématiques', 'Sciences/Social', 'Arts', 'Français (Afternoon)'].map(subject => (
                      <div
                        key={subject}
                        style={{
                          padding: '8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          cursor: 'move',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>☰</span>
                        <span style={{ fontSize: '14px' }}>{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveSchedule}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}