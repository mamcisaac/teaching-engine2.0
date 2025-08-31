import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Calculator, Microscope, Globe, Palette, Heart } from 'lucide-react';

interface SubjectInfo {
  name: string;
  nameFr: string;
  units: number;
  lessons: number;
  hours: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const SUBJECTS: SubjectInfo[] = [
  {
    name: 'French (Immersion)',
    nameFr: 'Français (Immersion)',
    units: 10,
    lessons: 195,
    hours: 146.25,
    icon: <BookOpen className="h-8 w-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    name: 'Mathematics',
    nameFr: 'Mathématiques',
    units: 10,
    lessons: 195,
    hours: 146.25,
    icon: <Calculator className="h-8 w-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100'
  },
  {
    name: 'Science',
    nameFr: 'Sciences de la nature',
    units: 10,
    lessons: 195,
    hours: 146.25,
    icon: <Microscope className="h-8 w-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    name: 'Visual Arts',
    nameFr: 'Arts visuels',
    units: 10,
    lessons: 195,
    hours: 146.25,
    icon: <Palette className="h-8 w-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  {
    name: 'Social Studies',
    nameFr: 'Sciences humaines',
    units: 5,
    lessons: 97,
    hours: 72.75,
    icon: <Globe className="h-8 w-8" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100'
  },
  {
    name: 'Health & Personal Development',
    nameFr: 'Formation personnelle et sociale',
    units: 5,
    lessons: 98,
    hours: 73.5,
    icon: <Heart className="h-8 w-8" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100'
  }
];

export function SubjectDashboard(): React.ReactElement {
  const navigate = useNavigate();

  const handleSubjectClick = (subject: string): void => {
    // Navigate to units filtered by subject
    navigate(`/planner/units?subject=${encodeURIComponent(subject)}`);
  };

  const totalStats = {
    units: SUBJECTS.reduce((sum, s) => sum + s.units, 0),
    lessons: SUBJECTS.reduce((sum, s) => sum + s.lessons, 0),
    hours: SUBJECTS.reduce((sum, s) => sum + s.hours, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your 6 Selected Subjects
        </h2>
        <p className="text-lg text-gray-600">
          Click any subject to explore its unit plans
        </p>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((subject) => (
          <Card 
            key={subject.nameFr}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${subject.bgColor}`}
            onClick={() => handleSubjectClick(subject.nameFr)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={subject.color}>
                  {subject.icon}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{subject.units}</p>
                  <p className="text-xs text-gray-500">Units</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {subject.nameFr}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {subject.name}
              </p>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-700">{subject.lessons}</p>
                  <p className="text-xs text-gray-500">Lessons</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">{subject.hours}h</p>
                  <p className="text-xs text-gray-500">Teaching Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">{totalStats.units}</p>
              <p className="text-sm text-gray-600">Total Units</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{totalStats.lessons}</p>
              <p className="text-sm text-gray-600">Total Lessons</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-pink-600">{Math.round(totalStats.hours)}</p>
              <p className="text-sm text-gray-600">Teaching Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}