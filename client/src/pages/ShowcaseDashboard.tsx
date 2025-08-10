import React, { useState } from 'react';
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
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { useLongRangePlans, useUnitPlans, useETFOLessonPlans } from '../hooks/useETFOPlanning';

// Sample lesson data for showcase
const sampleLessons = [
  { day: "Sept 4", title: "Bienvenue en immersion française!", subtitle: "Welcome to French Immersion" },
  { day: "Sept 5", title: "Notre communauté de classe", subtitle: "Our Classroom Community" },
  { day: "Sept 8", title: "Le français partout", subtitle: "French All Around Us" },
  { day: "Sept 9", title: "La magie des jours", subtitle: "Days of the Week Magic" },
  { day: "Sept 10", title: "Nos noms spéciaux", subtitle: "Our Special Names" }
];

const subjectColors: Record<string, string> = {
  'Français langue première': 'bg-blue-500',
  'Mathématiques': 'bg-green-500',
  'Sciences de la nature': 'bg-purple-500',
  'Sciences humaines': 'bg-yellow-500',
  'Éducation physique': 'bg-red-500',
  'Arts visuels': 'bg-pink-500',
  'Formation personnelle et sociale': 'bg-indigo-500',
  'Music': 'bg-orange-500'
};

const subjectIcons: Record<string, JSX.Element> = {
  'Français langue première': <BookOpen className="h-6 w-6" />,
  'Mathématiques': <Grid3x3 className="h-6 w-6" />,
  'Sciences de la nature': <Sparkles className="h-6 w-6" />,
  'Sciences humaines': <MapPin className="h-6 w-6" />,
  'Éducation physique': <Users className="h-6 w-6" />,
  'Arts visuels': <Star className="h-6 w-6" />,
  'Formation personnelle et sociale': <Target className="h-6 w-6" />,
  'Music': <Award className="h-6 w-6" />
};

export function ShowcaseDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Fetch actual data
  const { data: longRangePlans = [] } = useLongRangePlans();
  const { data: allUnits = [] } = useUnitPlans({});
  const { data: septemberLessons = [] } = useETFOLessonPlans({
    startDate: new Date('2025-09-01').toISOString(),
    endDate: new Date('2025-09-30').toISOString(),
  });
  
  // Calculate days until school starts
  const schoolStartDate = new Date('2025-09-04');
  const today = new Date();
  const daysUntilSchool = differenceInDays(schoolStartDate, today);
  
  // Group units by subject
  const unitsBySubject = allUnits.reduce((acc, unit) => {
    const subject = unit.longRangePlan?.subject || 'Unknown';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(unit);
    return acc;
  }, {} as Record<string, typeof allUnits>);
  
  // Filter units by selected subject
  const displayedUnits = selectedSubject 
    ? unitsBySubject[selectedSubject] || []
    : allUnits.slice(0, 6); // Show first 6 if no subject selected
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Welcome Emily! 🎉
              </h1>
              <p className="text-2xl mb-2">
                Your Complete 2025-2026 School Year is Ready!
              </p>
              <p className="text-lg opacity-90">
                Grade 1 French Immersion • West Kent Elementary • PEI
              </p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur rounded-lg p-6">
              <p className="text-6xl font-bold">{daysUntilSchool > 0 ? daysUntilSchool : 'Ready!'}</p>
              <p className="text-lg mt-2">
                {daysUntilSchool > 0 ? 'Days Until School' : 'School Year Active'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Impact Stats */}
      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-blue-600">8</p>
              <p className="text-gray-600 mt-2">Complete Subjects</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-green-600">53</p>
              <p className="text-gray-600 mt-2">Unit Plans Ready</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-purple-600">978</p>
              <p className="text-gray-600 mt-2">Teaching Hours</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-0 transform hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-orange-600">100%</p>
              <p className="text-gray-600 mt-2">Curriculum Covered</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - September Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* September Teaching Preview */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-green-600" />
                      September 2025 - Ready to Start!
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Your first unit "Bienvenue à l'école!" has 19 detailed lesson plans
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white px-3 py-1 text-lg">
                    READY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {sampleLessons.map((lesson, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/planner/units')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {lesson.day}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-600">{lesson.subtitle}</p>
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
                  View All 19 September Lessons
                </Button>
              </CardContent>
            </Card>
            
            {/* Subject Grid */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Your 8 Complete Subjects</CardTitle>
                <CardDescription>Click any subject to explore its unit plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(unitsBySubject).map(([subject, units]) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                      className={`p-4 rounded-lg text-white transform hover:scale-105 transition-all ${
                        subjectColors[subject] || 'bg-gray-500'
                      } ${selectedSubject === subject ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        {subjectIcons[subject] || <BookOpen className="h-6 w-6" />}
                        <p className="text-2xl font-bold mt-2">{units.length}</p>
                        <p className="text-xs opacity-90">Units</p>
                      </div>
                    </button>
                  ))}
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
                          {unit.titleFr || unit.title}
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
                  Explore All 53 Unit Plans
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Quick Access & Info */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-lg border-2 border-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
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
                <CardDescription>September 4, 2025</CardDescription>
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
                Your entire school year is planned with 53 comprehensive unit plans and 19 detailed lesson plans for September. You can start teaching with confidence!
              </AlertDescription>
            </Alert>
            
            {/* Year Timeline */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Year Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'].map((month, idx) => (
                    <div key={month} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${idx < 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-sm ${idx < 3 ? 'font-semibold' : 'text-gray-600'}`}>
                        {month} 2025{idx > 3 ? '6' : ''}
                      </span>
                      {idx === 0 && <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}