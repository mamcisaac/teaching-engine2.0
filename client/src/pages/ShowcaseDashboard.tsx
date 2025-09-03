import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays } from 'date-fns';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  Users, 
  Target,
  ChevronRight,
  Award,
  MapPin,
  Sparkles,
  Eye,
  FileText,
  Layers,
  Grid3x3,
  CheckCircle2,
  Star,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { usePublicStats } from '../hooks/usePublicStats';
import { SubjectSelectionModal } from '../components/SubjectSelectionModal';

// Dynamic lesson data will be loaded from database

const subjectColors: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-500',
  'Mathématiques': 'bg-green-500',
  'Sciences de la nature': 'bg-purple-500',
  'Sciences humaines': 'bg-yellow-500',
  'Éducation physique': 'bg-red-500',
  'Arts visuels': 'bg-pink-500',
  'Formation personnelle et sociale': 'bg-indigo-500',
  'Musique': 'bg-orange-500'
};

const subjectIcons: Record<string, JSX.Element> = {
  'Français (Immersion)': <BookOpen className="h-6 w-6" />,
  'Mathématiques': <Grid3x3 className="h-6 w-6" />,
  'Sciences de la nature': <Sparkles className="h-6 w-6" />,
  'Sciences humaines': <MapPin className="h-6 w-6" />,
  'Éducation physique': <Users className="h-6 w-6" />,
  'Arts visuels': <Star className="h-6 w-6" />,
  'Formation personnelle et sociale': <Target className="h-6 w-6" />,
  'Musique': <Award className="h-6 w-6" />
};

export function ShowcaseDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  
  // Load saved subjects on component mount
  useEffect(() => {
    const saved = localStorage.getItem('teacher-subjects');
    if (saved) {
      try {
        const subjects = JSON.parse(saved);
        setTeacherSubjects(Array.isArray(subjects) ? subjects : []);
      } catch {
        // Default subjects for Grade 1 French Immersion
        setTeacherSubjects([
          'Français (Immersion)',
          'Mathématiques',
          'Sciences de la nature',
          'Sciences humaines',
          'Arts visuels',
          'Musique',
          'Éducation physique',
          'Formation personnelle et sociale'
        ]);
      }
    } else {
      // Default subjects - all 8 for Grade 1
      setTeacherSubjects([
        'Français (Immersion)',
        'Mathématiques',
        'Sciences de la nature',
        'Sciences humaines',
        'Arts visuels',
        'Musique',
        'Éducation physique',
        'Formation personnelle et sociale'
      ]);
    }
  }, []);

  // Handle subject save
  const handleSubjectSave = (subjects: string[]) => {
    setTeacherSubjects(subjects);
    // Force a refresh if needed
    window.location.reload();
  };
  
  // Fetch public stats from database (no auth required)
  const { data: publicData, isLoading, error } = usePublicStats();
  
  // Use fetched data with proper fallbacks
  const stats = publicData?.stats || { unitCount: 0, lessonCount: 0, lrpCount: 0, totalHours: 0 };
  const sampleUnits = publicData?.sampleUnits || [];
  const academicYear = publicData?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  
  
  // Calculate dynamic dates
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const schoolStartDate = new Date(`${currentYear}-09-04`);
  const today = new Date();
  const daysUntilSchool = differenceInDays(schoolStartDate, today);
  
  // Get September lessons from sample units (first month of school)
  const septemberLessons = sampleUnits.filter(unit => {
    const unitDate = new Date(unit.startDate);
    return unitDate.getMonth() === 8 && unitDate.getFullYear() === currentYear; // September = month 8
  }).slice(0, 5); // Show first 5 for preview
  
  // Use dynamic stats from API
  const totalHours = stats.totalHours;
  const totalLessons = stats.lessonCount;
  const totalUnits = stats.unitCount;
  const septemberLessonCount = septemberLessons.length;
  
  // Group units by subject using sample units
  const unitsBySubject = sampleUnits.reduce((acc, unit) => {
    const subject = unit.longRangePlan?.subject || 'Unknown';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(unit);
    return acc;
  }, {} as Record<string, typeof sampleUnits>);
  
  // Filter units by selected subject
  const displayedUnits = selectedSubject 
    ? unitsBySubject[selectedSubject] || []
    : sampleUnits.slice(0, 6); // Show first 6 if no subject selected
  
  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Welcome Emily! 🎉
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-2">
                Your Complete {academicYear} School Year is Ready!
              </p>
              <p className="text-sm sm:text-base lg:text-lg opacity-90">
                Grade 1 French Immersion • West Kent Elementary • PEI
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate('/planner/today')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  🕐 Today's Teaching
                </button>
                <button
                  onClick={() => navigate('/planner/week')}
                  className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                >
                  📅 Week View
                </button>
              </div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur rounded-lg p-4 sm:p-6">
              <p className="text-lg font-semibold mb-2">{format(today, 'EEEE')}</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{format(today, 'MMM d')}</p>
              <p className="text-sm sm:text-base mt-2">
                {daysUntilSchool > 0 ? `${daysUntilSchool} days until school` : format(today, 'yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Impact Stats */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-4 sm:p-6 text-center relative">
              <Settings className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">
                {teacherSubjects.length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                Selected Subjects
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">{sampleUnits.length || '0'}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Unit Plans Ready</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">978</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Teaching Hours</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600">100%</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Curriculum Covered</p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        <div className="grid grid-cols-1 3xl:grid-cols-3 gap-6 lg:gap-8 max-w-screen-2xl mx-auto">
          
          {/* Left Column - September Preview */}
          <div className="3xl:col-span-2 space-y-6 min-w-0">
            
            {/* September Teaching Preview */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-green-600" />
                      September {currentYear} - Ready to Start!
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Your first units have {septemberLessonCount} detailed lesson plans
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white px-3 py-1 text-lg">
                    READY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {septemberLessons.map((lesson, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/planner/units')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {format(new Date(lesson.startDate), 'MMM d')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-600">{lesson.longRangePlan?.subject || 'Subject'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/planner/units')}
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View All {septemberLessonCount} September Lessons
                </Button>
              </CardContent>
            </Card>
            
            {/* Subject Grid */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      Your {teacherSubjects.length} Selected Subjects
                    </CardTitle>
                    <CardDescription>Click any subject to explore its unit plans</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsSubjectModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Modify
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {teacherSubjects.length > 0 ? (
                    teacherSubjects.map((subject) => {
                      const units = unitsBySubject[subject] || [];
                      return (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                          className={`p-4 rounded-lg text-white transform hover:scale-105 transition-all ${
                            subjectColors[subject] || 'bg-gray-500'
                          } ${selectedSubject === subject ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                        >
                          <div className="flex flex-col items-center">
                            {subjectIcons[subject] || <BookOpen className="h-6 w-6" />}
                            <p className="text-xs font-semibold opacity-95 mb-1">{subject}</p>
                            <p className="text-2xl font-bold">{units.length}</p>
                            <p className="text-xs opacity-90">Units</p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center text-gray-500">
                      <p>No subjects selected. Click "Modify" to select your teaching subjects.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Unit Explorer */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span>
                    {selectedSubject ? `${selectedSubject} Units` : 'Featured Unit Plans'}
                  </span>
                  {selectedSubject && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSubject(null)}
                    >
                      Show All
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedSubject 
                    ? `${displayedUnits.length} units in ${selectedSubject}`
                    : 'Explore your complete year of teaching'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedUnits.map((unit) => (
                    <div 
                      key={unit.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/planner/units/${unit.id}/lessons`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {unit.title}
                        </h3>
                        <Badge variant="outline">
                          {unit.estimatedHours}h
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{unit.title}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{format(new Date(unit.startDate), 'MMM d')}</span>
                        <span>→</span>
                        <span>{format(new Date(unit.endDate), 'MMM d')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate('/planner/units')}
                >
                  <Layers className="h-5 w-5 mr-2" />
                  Explore All {sampleUnits.length || '0'} Unit Plans
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Quick Access & Info */}
          <div className="3xl:col-span-1 space-y-6 min-w-0">
            
            {/* Quick Actions */}
            <Card className="shadow-lg border-2 border-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button 
                  className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  variant="outline"
                  onClick={() => navigate('/planner/today')}
                >
                  <Clock className="h-5 w-5 mr-3" />
                  Today's Teaching
                </Button>
                <Button 
                  className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  variant="outline"
                  onClick={() => navigate('/planner/week')}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Weekly Schedule
                </Button>
                <hr className="my-2" />
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/planner/units')}
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  View September Teaching
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/planner/long-range')}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Year at a Glance
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/planner/units')}
                >
                  <Layers className="h-5 w-5 mr-3" />
                  All Unit Plans
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/curriculum')}
                >
                  <Target className="h-5 w-5 mr-3" />
                  Curriculum Coverage
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/planner/daybook')}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Teaching Journal
                </Button>
              </CardContent>
            </Card>
            
            {/* Sample Lesson Preview */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-xl">First Lesson Preview</CardTitle>
                <CardDescription>September 4, {currentYear}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg mb-2">
                  Bienvenue en immersion française!
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">🧠 Minds On (15 min)</p>
                    <p className="text-gray-600">
                      Welcome circle, Bonjour song, name games with rhythm
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">🎯 Action (35 min)</p>
                    <p className="text-gray-600">
                      Classroom tour in French, practice greetings, create self-portraits
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">✨ Consolidation (10 min)</p>
                    <p className="text-gray-600">
                      Share portraits, goodbye song, celebrate first day
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate('/planner/units')}
                >
                  View Full Lesson Plan
                </Button>
              </CardContent>
            </Card>
            
            {/* Success Message */}
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Everything is ready!</strong><br />
                Your entire school year is planned with {sampleUnits.length || '0'} comprehensive unit plans and {totalLessons} detailed lesson plans ({totalHours.toFixed(1)} hours total). You can start teaching with confidence!
              </AlertDescription>
            </Alert>
            
            {/* Year Timeline */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Year Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'].map((month, idx) => {
                    const year = idx > 3 ? nextYear : currentYear;
                    return (
                    <div key={month} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${idx < 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-sm ${idx < 3 ? 'font-semibold' : 'text-gray-600'}`}>
                        {month} {year}
                      </span>
                      {idx === 0 && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Subject Selection Modal */}
      <SubjectSelectionModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={handleSubjectSave}
      />
    </div>
  );
}