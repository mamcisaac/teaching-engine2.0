import React, { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  parentEmail?: string;
  parentPhone?: string;
  preferredContact?: 'email' | 'sms' | 'app';
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'progress' | 'concern' | 'celebration' | 'meeting';
  subject: string;
  body: string;
  variables: string[];
}

interface ParentCommunicationProps {
  students: Student[];
  assessmentDate: string;
  lessonTitle: string;
  expectation: string;
  onClose?: () => void;
}

const DEFAULT_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'progress-update',
    name: 'Progress Update',
    type: 'progress',
    subject: 'Assessment Update: {studentName}',
    body: `Dear {parentName},

I wanted to share {studentName}'s progress from today's assessment on "{lessonTitle}".

Current Level: {level}
Learning Goal: {expectation}

{levelDescription}

{nextSteps}

Please feel free to reach out if you have any questions or would like to discuss {studentName}'s progress further.

Best regards,
{teacherName}`,
    variables: ['studentName', 'parentName', 'lessonTitle', 'level', 'expectation', 'levelDescription', 'nextSteps', 'teacherName']
  },
  {
    id: 'celebration',
    name: 'Celebration',
    type: 'celebration',
    subject: '🌟 Great news about {studentName}!',
    body: `Dear {parentName},

I'm excited to share that {studentName} demonstrated excellent understanding in today's lesson on "{lessonTitle}"!

{studentName} is exceeding expectations in {expectation}.

{celebrationDetails}

Keep up the great work at home supporting {studentName}'s learning!

Warmly,
{teacherName}`,
    variables: ['studentName', 'parentName', 'lessonTitle', 'expectation', 'celebrationDetails', 'teacherName']
  },
  {
    id: 'support-needed',
    name: 'Support Needed',
    type: 'concern',
    subject: 'Let\'s work together to support {studentName}',
    body: `Dear {parentName},

I wanted to reach out about {studentName}'s progress in "{lessonTitle}".

{studentName} is currently working towards mastering: {expectation}

I've noticed {concernDetails}

Here are some ways we can support {studentName} together:
{supportStrategies}

Would you be available for a brief call or meeting to discuss how we can best support {studentName}?

Thank you for your partnership,
{teacherName}`,
    variables: ['studentName', 'parentName', 'lessonTitle', 'expectation', 'concernDetails', 'supportStrategies', 'teacherName']
  }
];

export function ParentCommunication({
  students,
  assessmentDate,
  lessonTitle,
  expectation,
  onClose
}: ParentCommunicationProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate>(DEFAULT_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'app'>('email');
  const [scheduling, setScheduling] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  // Filter students by level for quick selection
  const studentsByLevel = {
    NOT_YET: students.filter(s => s.level === 'NOT_YET'),
    APPROACHING: students.filter(s => s.level === 'APPROACHING'),
    MEETING: students.filter(s => s.level === 'MEETING'),
    EXCEEDING: students.filter(s => s.level === 'EXCEEDING')
  };

  // Generate message for a student
  const generateMessage = (student: Student, template: CommunicationTemplate): string => {
    let message = template.body;
    
    // Replace variables
    const replacements: Record<string, string> = {
      studentName: student.firstName,
      parentName: `Parent/Guardian of ${student.firstName}`,
      lessonTitle,
      expectation,
      level: getLevelDescription(student.level),
      levelDescription: getDetailedLevelDescription(student.level),
      nextSteps: getNextSteps(student.level),
      celebrationDetails: getCelebrationDetails(student.level),
      concernDetails: getConcernDetails(student.level),
      supportStrategies: getSupportStrategies(student.level),
      teacherName: 'Ms. Emily', // Would come from auth context
      date: format(new Date(assessmentDate), 'MMMM d, yyyy')
    };
    
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    return message;
  };

  const getLevelDescription = (level: string): string => {
    const descriptions = {
      NOT_YET: 'Not Yet Meeting Expectations',
      APPROACHING: 'Approaching Expectations',
      MEETING: 'Meeting Expectations',
      EXCEEDING: 'Exceeding Expectations'
    };
    return descriptions[level as keyof typeof descriptions] || level;
  };

  const getDetailedLevelDescription = (level: string): string => {
    const descriptions = {
      NOT_YET: 'Your child is still developing understanding of this concept and needs additional support.',
      APPROACHING: 'Your child is making progress and approaching grade-level expectations.',
      MEETING: 'Your child is meeting grade-level expectations and demonstrating solid understanding.',
      EXCEEDING: 'Your child is exceeding expectations and showing advanced understanding.'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  const getNextSteps = (level: string): string => {
    const steps = {
      NOT_YET: 'We will provide additional small-group instruction and practice with concrete materials.',
      APPROACHING: 'We will continue with guided practice and scaffolded support.',
      MEETING: 'We will maintain current learning pace and introduce enrichment activities.',
      EXCEEDING: 'We will provide extension activities and opportunities for peer teaching.'
    };
    return steps[level as keyof typeof steps] || '';
  };

  const getCelebrationDetails = (level: string): string => {
    if (level === 'EXCEEDING') {
      return 'Your child showed exceptional problem-solving skills and was able to help teach other students!';
    } else if (level === 'MEETING') {
      return 'Your child demonstrated solid understanding and completed all tasks independently.';
    }
    return 'Your child showed great effort and perseverance!';
  };

  const getConcernDetails = (level: string): string => {
    if (level === 'NOT_YET') {
      return 'some challenges with the foundational concepts that we need to address';
    } else if (level === 'APPROACHING') {
      return 'they need a bit more practice to solidify their understanding';
    }
    return '';
  };

  const getSupportStrategies = (level: string): string => {
    const strategies = {
      NOT_YET: `• Practice counting objects at home
• Use everyday items for math practice
• Read together for 15 minutes daily
• Review sight words using flashcards`,
      APPROACHING: `• Continue daily reading practice
• Practice the concept using online games
• Complete review worksheets sent home
• Encourage explaining their thinking`,
      MEETING: `• Encourage independent reading
• Provide opportunities for real-world application
• Support their interests with library books`,
      EXCEEDING: `• Provide challenging puzzles and games
• Encourage creative projects
• Visit museums and educational sites
• Support independent research interests`
    };
    return strategies[level as keyof typeof strategies] || '';
  };

  // Select all students at a level
  const selectLevel = (level: string) => {
    const levelStudents = studentsByLevel[level as keyof typeof studentsByLevel];
    const newSelected = new Set(selectedStudents);
    levelStudents.forEach(s => newSelected.add(s.id));
    setSelectedStudents(newSelected);
  };

  // Send communications
  const sendCommunications = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    setSending(true);
    
    try {
      // Simulate sending messages
      const messages = Array.from(selectedStudents).map(studentId => {
        const student = students.find(s => s.id === studentId);
        if (!student) return null;
        
        const message = customMessage || generateMessage(student, selectedTemplate);
        
        return {
          to: student.parentEmail || 'parent@example.com',
          subject: selectedTemplate.subject.replace('{studentName}', student.firstName),
          body: message,
          method: sendMethod,
          scheduledFor: scheduling === 'scheduled' ? scheduledTime : null
        };
      }).filter(Boolean);
      
      // In production, would call API to send messages
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log to communication history
      const history = {
        date: new Date().toISOString(),
        template: selectedTemplate.id,
        recipients: Array.from(selectedStudents),
        method: sendMethod,
        scheduled: scheduling === 'scheduled',
        scheduledTime
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('parent-communications') || '[]');
      existingHistory.push(history);
      localStorage.setItem('parent-communications', JSON.stringify(existingHistory));
      
      toast.success(`Successfully ${scheduling === 'scheduled' ? 'scheduled' : 'sent'} ${messages.length} messages`);
      
      // Clear selection
      setSelectedStudents(new Set());
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to send communications:', error);
      toast.error('Failed to send some messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold">Parent Communication</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Send assessment updates to parents based on today's results
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Student Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Students</h3>
              
              {/* Quick select by level */}
              <div className="mb-4 flex gap-2">
                {Object.entries(studentsByLevel).map(([level, levelStudents]) => (
                  <button
                    key={level}
                    onClick={() => selectLevel(level)}
                    className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    {level.replace('_', ' ')} ({levelStudents.length})
                  </button>
                ))}
              </div>
              
              {/* Student list */}
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedStudents);
                        if (e.target.checked) {
                          newSelected.add(student.id);
                        } else {
                          newSelected.delete(student.id);
                        }
                        setSelectedStudents(newSelected);
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-gray-600">
                        {getLevelDescription(student.level)}
                      </div>
                    </div>
                    {student.parentEmail && (
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Message Configuration */}
            <div>
              <h3 className="font-semibold mb-3">Message Settings</h3>
              
              {/* Template selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Template</label>
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = DEFAULT_TEMPLATES.find(t => t.id === e.target.value);
                    if (template) setSelectedTemplate(template);
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {DEFAULT_TEMPLATES.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Send method */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Send via</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="email"
                      checked={sendMethod === 'email'}
                      onChange={(e) => setSendMethod(e.target.value as any)}
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="sms"
                      checked={sendMethod === 'sms'}
                      onChange={(e) => setSendMethod(e.target.value as any)}
                    />
                    <span className="text-sm">SMS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="app"
                      checked={sendMethod === 'app'}
                      onChange={(e) => setSendMethod(e.target.value as any)}
                    />
                    <span className="text-sm">App</span>
                  </label>
                </div>
              </div>
              
              {/* Scheduling */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">When to send</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="now"
                      checked={scheduling === 'now'}
                      onChange={(e) => setScheduling(e.target.value as any)}
                    />
                    <span className="text-sm">Now</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={scheduling === 'scheduled'}
                      onChange={(e) => setScheduling(e.target.value as any)}
                    />
                    <span className="text-sm">Schedule</span>
                  </label>
                </div>
                
                {scheduling === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-2 px-3 py-2 border rounded-lg"
                  />
                )}
              </div>
              
              {/* Custom message */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!customMessage}
                    onChange={(e) => setCustomMessage(e.target.checked ? selectedTemplate.body : '')}
                  />
                  <span className="text-sm font-medium">Customize message</span>
                </label>
                
                {customMessage && (
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full h-32 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Enter custom message..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && selectedStudents.size > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Preview</h3>
              <div className="bg-white p-4 rounded border">
                <div className="text-sm">
                  <div className="font-medium mb-1">
                    To: {students.find(s => s.id === Array.from(selectedStudents)[0])?.parentEmail || 'parent@example.com'}
                  </div>
                  <div className="font-medium mb-3">
                    Subject: {selectedTemplate.subject.replace('{studentName}', 
                      students.find(s => s.id === Array.from(selectedStudents)[0])?.firstName || 'Student'
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {generateMessage(
                      students.find(s => s.id === Array.from(selectedStudents)[0])!,
                      selectedTemplate
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(!preview)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {preview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                onClick={sendCommunications}
                disabled={sending || selectedStudents.size === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {scheduling === 'scheduled' ? 'Schedule' : 'Send'} Messages
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}