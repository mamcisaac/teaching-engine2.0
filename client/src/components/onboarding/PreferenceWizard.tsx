import { useState } from 'react';

import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PreferenceWizardProps {
  onComplete: (preferences: TeacherPreferences) => void;
  onSkip: () => void;
}

interface TeacherPreferences {
  grade: string;
  subjects: string[];
  planningStyle: string;
  aiAssistanceLevel: string;
  theme: string;
  notifications: {
    deadlineReminders: boolean;
    weeklyDigest: boolean;
    curriculumUpdates: boolean;
  };
}

export function PreferenceWizard({ onComplete, onSkip }: PreferenceWizardProps): React.ReactElement {
  const [preferences, setPreferences] = useState<TeacherPreferences>({
    grade: '',
    subjects: [],
    planningStyle: 'detailed',
    aiAssistanceLevel: 'moderate',
    theme: 'light',
    notifications: {
      deadlineReminders: true,
      weeklyDigest: true,
      curriculumUpdates: false,
    },
  });

  const grades = [
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
  ];

  const subjects = [
    'Mathematics',
    'Language Arts',
    'Science',
    'Social Studies',
    'French',
    'Arts',
    'Physical Education',
    'Health',
    'Music',
  ];

  const handleSubjectChange = (subject: string, checked: boolean): void => {
    setPreferences(prev => ({
      ...prev,
      subjects: checked
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s != subject),
    }));
  };

  const handleNotificationChange = (key: keyof typeof preferences.notifications, checked: boolean): void => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }));
  };

  const handleComplete = (): void => {
    // Save preferences to localStorage for now
    localStorage.setItem('teacher-preferences', JSON.stringify(preferences));
    onComplete(preferences);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Experience</h2>
        <p className="text-gray-600">Help us tailor Teaching Engine 2.0 to your needs</p>
      </div>

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>What grade do you teach?</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.grade}
            onValueChange={(value) => {
 setPreferences(prev => ({ ...prev, grade: value })); 
}}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map(grade => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Which subjects do you teach?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  checked={preferences.subjects.includes(subject)}
                  id={subject}
                  onCheckedChange={(checked) => {
 handleSubjectChange(subject, checked as boolean); 
}}
                />
                <Label className="text-sm font-medium" htmlFor={subject}>
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning Style */}
      <Card>
        <CardHeader>
          <CardTitle>How detailed do you like your lesson plans?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.planningStyle === 'brief'}
                className="text-indigo-600"
                id="brief"
                name="planningStyle"
                type="radio"
                value="brief"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, planningStyle: e.target.value })); 
}}
              />
              <Label htmlFor="brief">Brief - Key points and activities only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.planningStyle === 'detailed'}
                className="text-indigo-600"
                id="detailed"
                name="planningStyle"
                type="radio"
                value="detailed"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, planningStyle: e.target.value })); 
}}
              />
              <Label htmlFor="detailed">Detailed - Comprehensive plans with all sections</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.planningStyle === 'comprehensive'}
                className="text-indigo-600"
                id="comprehensive"
                name="planningStyle"
                type="radio"
                value="comprehensive"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, planningStyle: e.target.value })); 
}}
              />
              <Label htmlFor="comprehensive">Comprehensive - Everything including assessments and modifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistance Level */}
      <Card>
        <CardHeader>
          <CardTitle>How much AI assistance would you like?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.aiAssistanceLevel === 'minimal'}
                className="text-indigo-600"
                id="minimal"
                name="aiAssistance"
                type="radio"
                value="minimal"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, aiAssistanceLevel: e.target.value })); 
}}
              />
              <Label htmlFor="minimal">Minimal - Only when I ask for help</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.aiAssistanceLevel === 'moderate'}
                className="text-indigo-600"
                id="moderate"
                name="aiAssistance"
                type="radio"
                value="moderate"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, aiAssistanceLevel: e.target.value })); 
}}
              />
              <Label htmlFor="moderate">Moderate - Smart suggestions and auto-completion</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                checked={preferences.aiAssistanceLevel === 'high'}
                className="text-indigo-600"
                id="high"
                name="aiAssistance"
                type="radio"
                value="high"
                onChange={(e) => {
 setPreferences(prev => ({ ...prev, aiAssistanceLevel: e.target.value })); 
}}
              />
              <Label htmlFor="high">High - Proactive suggestions and automated planning</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={preferences.notifications.deadlineReminders}
                id="deadlineReminders"
                onCheckedChange={(checked) => {
 handleNotificationChange('deadlineReminders', checked as boolean); 
}}
              />
              <Label htmlFor="deadlineReminders">Deadline and task reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={preferences.notifications.weeklyDigest}
                id="weeklyDigest"
                onCheckedChange={(checked) => {
 handleNotificationChange('weeklyDigest', checked as boolean); 
}}
              />
              <Label htmlFor="weeklyDigest">Weekly planning digest</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={preferences.notifications.curriculumUpdates}
                id="curriculumUpdates"
                onCheckedChange={(checked) => {
 handleNotificationChange('curriculumUpdates', checked as boolean); 
}}
              />
              <Label htmlFor="curriculumUpdates">Curriculum updates and new features</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Interface Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.theme}
            onValueChange={(value) => {
 setPreferences(prev => ({ ...prev, theme: value })); 
}}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light Theme</SelectItem>
              <SelectItem value="dark">Dark Theme</SelectItem>
              <SelectItem value="system">System Preference</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button aria-label="Click button" onClick={onSkip}>
          Skip for Now
        </Button>
        <Button 
          disabled={preferences.grade === '' || preferences.subjects.length === 0}
          onClick={handleComplete}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}