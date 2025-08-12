import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';

// Weekly lesson schedule for Emily's Grade 1 French Immersion
const weekSchedule = {
  Monday: [
    { time: '9:00', subject: 'Français', title: 'Les sons et les lettres', duration: 60 },
    { time: '10:15', subject: 'Mathématiques', title: 'Les nombres 1-10', duration: 45 },
    { time: '11:15', subject: 'Sciences', title: 'Observer la nature', duration: 30 },
    { time: '1:00', subject: 'Arts visuels', title: 'Créer avec les couleurs', duration: 45 },
    { time: '2:00', subject: 'Éducation physique', title: 'Jeux de mouvement', duration: 45 }
  ],
  Tuesday: [
    { time: '9:00', subject: 'Français', title: 'Les mots fréquents', duration: 60 },
    { time: '10:15', subject: 'Mathématiques', title: 'Compter jusqu\'à 20', duration: 45 },
    { time: '11:15', subject: 'Sciences humaines', title: 'Notre école', duration: 30 },
    { time: '1:00', subject: 'Musique', title: 'Chansons françaises', duration: 45 },
    { time: '2:00', subject: 'Formation personnelle', title: 'Les émotions', duration: 45 }
  ],
  Wednesday: [
    { time: '9:00', subject: 'Français', title: 'Écriture émergente', duration: 60 },
    { time: '10:15', subject: 'Mathématiques', title: 'Les formes géométriques', duration: 45 },
    { time: '11:15', subject: 'Sciences', title: 'Les saisons', duration: 30 },
    { time: '1:00', subject: 'Arts visuels', title: 'Dessiner notre monde', duration: 45 },
    { time: '2:00', subject: 'Éducation physique', title: 'Coordination et équilibre', duration: 45 }
  ],
  Thursday: [
    { time: '9:00', subject: 'Français', title: 'Lecture partagée', duration: 60 },
    { time: '10:15', subject: 'Mathématiques', title: 'Résolution de problèmes', duration: 45 },
    { time: '11:15', subject: 'Sciences humaines', title: 'Ma famille', duration: 30 },
    { time: '1:00', subject: 'Musique', title: 'Rythmes et instruments', duration: 45 },
    { time: '2:00', subject: 'Formation personnelle', title: 'Amitié et respect', duration: 45 }
  ],
  Friday: [
    { time: '9:00', subject: 'Français', title: 'Centres de littératie', duration: 60 },
    { time: '10:15', subject: 'Mathématiques', title: 'Jeux mathématiques', duration: 45 },
    { time: '11:15', subject: 'Sciences', title: 'Exploration libre', duration: 30 },
    { time: '1:00', subject: 'Arts/Musique', title: 'Projet créatif', duration: 45 },
    { time: '2:00', subject: 'Célébration', title: 'Partage de la semaine', duration: 45 }
  ]
};

const subjectColors: Record<string, string> = {
  'Français': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences': 'bg-purple-100 text-purple-800 border-purple-300',
  'Sciences humaines': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Arts visuels': 'bg-pink-100 text-pink-800 border-pink-300',
  'Musique': 'bg-orange-100 text-orange-800 border-orange-300',
  'Éducation physique': 'bg-red-100 text-red-800 border-red-300',
  'Formation personnelle': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Arts/Musique': 'bg-teal-100 text-teal-800 border-teal-300',
  'Célébration': 'bg-amber-100 text-amber-800 border-amber-300'
};

export function SimpleWeekView(): React.ReactElement {
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9:00', '10:15', '11:15', '1:00', '2:00'];
  
  // Check if current date is within school year (Sept 2025 - June 2026)
  const schoolStartDate = new Date('2025-09-04');
  const schoolEndDate = new Date('2026-06-26');
  const isSchoolYear = today >= schoolStartDate && today <= schoolEndDate;
  
  // Check for specific breaks
  const isChristmasBreak = (today >= new Date('2025-12-22') && today <= new Date('2026-01-04'));
  const isMarchBreak = (today >= new Date('2026-03-09') && today <= new Date('2026-03-13'));
  const isSummerVacation = today < schoolStartDate || today > schoolEndDate;

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1400px',
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
              Weekly Schedule
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Week of {format(weekStart, 'MMMM d, yyyy')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
              Monthly Calendar
            </button>
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
      
      {/* Weekly Grid - Only show during school year */}
      {isSchoolYear && !isChristmasBreak && !isMarchBreak && (
        <>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Days Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(5, 1fr)',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ padding: '16px', borderRight: '1px solid #e5e7eb' }}></div>
              {weekDays.map((day, index) => {
                const dayDate = addDays(weekStart, index);
                const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                
                return (
                  <div 
                    key={day}
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderRight: index < 4 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: isToday ? '#ede9fe' : 'transparent'
                    }}
                  >
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isToday ? '#6d28d9' : '#1f2937'
                    }}>
                      {day}
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: isToday ? '#7c3aed' : '#6b7280'
                    }}>
                      {format(dayDate, 'MMM d')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <div 
                key={time}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(5, 1fr)',
                  borderBottom: timeIndex < timeSlots.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                {/* Time Label */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRight: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {time}
                </div>
                
                {/* Lessons for each day */}
                {weekDays.map((day, dayIndex) => {
                  const lesson = weekSchedule[day as keyof typeof weekSchedule][timeIndex];
                  const colorClass = subjectColors[lesson.subject] || 'bg-gray-100 text-gray-800 border-gray-300';
                  const colors = colorClass.split(' ');
                  const bgColor = colors[0].replace('bg-', '').replace('-100', '');
                  
                  // Convert Tailwind-like colors to actual colors
                  const colorMap: Record<string, string> = {
                    'blue': '#dbeafe',
                    'green': '#d1fae5',
                    'purple': '#e9d5ff',
                    'yellow': '#fef3c7',
                    'pink': '#fce7f3',
                    'orange': '#fed7aa',
                    'red': '#fee2e2',
                    'indigo': '#e0e7ff',
                    'teal': '#ccfbf1',
                    'amber': '#fef3c7',
                    'gray': '#f3f4f6'
                  };
                  
                  const textColorMap: Record<string, string> = {
                    'blue': '#1e40af',
                    'green': '#166534',
                    'purple': '#6b21a8',
                    'yellow': '#854d0e',
                    'pink': '#9f1239',
                    'orange': '#9a3412',
                    'red': '#991b1b',
                    'indigo': '#3730a3',
                    'teal': '#134e4a',
                    'amber': '#854d0e',
                    'gray': '#374151'
                  };
                  
                  return (
                    <div 
                      key={`${day}-${time}`}
                      style={{
                        padding: '8px',
                        borderRight: dayIndex < 4 ? '1px solid #e5e7eb' : 'none',
                        minHeight: '80px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: colorMap[bgColor.split('-')[0]] || '#f3f4f6',
                          border: `1px solid ${colorMap[bgColor.split('-')[0]] || '#e5e7eb'}`,
                          borderRadius: '6px',
                          padding: '8px',
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onClick={() => navigate(`/planner/units/unit-1/lessons`)}
                      >
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: textColorMap[bgColor.split('-')[0]] || '#374151',
                          marginBottom: '4px'
                        }}>
                          {lesson.subject}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: textColorMap[bgColor.split('-')[0]] || '#4b5563',
                          lineHeight: '1.3'
                        }}>
                          {lesson.title}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: textColorMap[bgColor.split('-')[0]] || '#6b7280',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Clock style={{ width: '10px', height: '10px' }} />
                          {lesson.duration} min
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Weekly Summary - Only show during school year */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Weekly Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>25</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Lessons</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>1,275</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Teaching Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>10</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Different Subjects</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>5</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Hours of Français Daily</div>
              </div>
            </div>
          </div>

          {/* Subject Legend - Always show for reference */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Subject Colors
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(subjectColors).map(([subject, colorClass]) => {
                const colors = colorClass.split(' ');
                const bgColor = colors[0].replace('bg-', '').replace('-100', '');
                const colorMap: Record<string, string> = {
                  'blue': '#dbeafe',
                  'green': '#d1fae5',
                  'purple': '#e9d5ff',
                  'yellow': '#fef3c7',
                  'pink': '#fce7f3',
                  'orange': '#fed7aa',
                  'red': '#fee2e2',
                  'indigo': '#e0e7ff',
                  'teal': '#ccfbf1',
                  'amber': '#fef3c7',
                  'gray': '#f3f4f6'
                };
                const textColorMap: Record<string, string> = {
                  'blue': '#1e40af',
                  'green': '#166534',
                  'purple': '#6b21a8',
                  'yellow': '#854d0e',
                  'pink': '#9f1239',
                  'orange': '#9a3412',
                  'red': '#991b1b',
                  'indigo': '#3730a3',
                  'teal': '#134e4a',
                  'amber': '#854d0e',
                  'gray': '#374151'
                };
                
                return (
                  <div 
                    key={subject}
                    style={{
                      backgroundColor: colorMap[bgColor.split('-')[0]] || '#f3f4f6',
                      color: textColorMap[bgColor.split('-')[0]] || '#374151',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {subject}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}