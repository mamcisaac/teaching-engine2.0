import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  Package,
  Eye,
  Target,
  Clock,
  CheckCircle,
  Camera,
  BarChart3,
  FileBarChart,
  GitBranch
} from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { useNavigation } from './NavigationProvider';

interface TeachingNavItem {
  id: string;
  name: string;
  path: string;
  icon: JSX.Element;
  description: string;
  badge?: string;
}

export function TeachingNavigationSection(): React.ReactElement {
  const { isSidebarOpen } = useNavigation();

  const teachingItems: TeachingNavItem[] = [
    {
      id: 'showcase',
      name: "Year Overview",
      path: '/dashboard',
      icon: <Target className="h-5 w-5" />,
      description: 'Complete year view',
      badge: 'PRIMARY'
    },
    {
      id: 'units',
      name: 'Unit Plans',
      path: '/planner/units',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Complete unit plans',
    },
    {
      id: 'long-range',
      name: 'Long Range Plans',
      path: '/planner/long-range',
      icon: <Calendar className="h-5 w-5" />,
      description: '8 subject plans',
    },
    {
      id: 'today',
      name: "Today's Teaching",
      path: '/today',
      icon: <Clock className="h-5 w-5" />,
      description: 'Daily lesson view',
    },
    {
      id: 'week',
      name: 'Week View',
      path: '/planner/week',
      icon: <Eye className="h-5 w-5" />,
      description: 'Weekly schedule',
    },
    {
      id: 'daybook',
      name: 'Teaching Journal',
      path: '/planner/daybook',
      icon: <FileText className="h-5 w-5" />,
      description: 'Daily notes',
    },
    {
      id: 'hierarchy',
      name: 'Planning Hierarchy',
      path: '/planner/hierarchy',
      icon: <GitBranch className="h-5 w-5" />,
      description: 'LRP → Units → Lessons'
    },
  ];

  const resourceItems: TeachingNavItem[] = [
    {
      id: 'curriculum',
      name: 'Curriculum',
      path: '/curriculum',
      icon: <Package className="h-5 w-5" />,
      description: 'PEI expectations',
    },
    {
      id: 'templates',
      name: 'Templates',
      path: '/templates',
      icon: <FileText className="h-5 w-5" />,
      description: 'Lesson templates',
    },
    {
      id: 'parents',
      name: 'Parent Communication',
      path: '/newsletters',
      icon: <Users className="h-5 w-5" />,
      description: 'Newsletters & updates',
    },
  ];

  const assessmentItems: TeachingNavItem[] = [
    {
      id: 'students',
      name: 'Students',
      path: '/students',
      icon: <Users className="h-5 w-5" />,
      description: 'Class roster',
    },
    {
      id: 'assessment',
      name: 'Assessment',
      path: '/assessment',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Record assessments',
    },
    {
      id: 'artifacts',
      name: 'Artifacts',
      path: '/artifacts',
      icon: <Camera className="h-5 w-5" />,
      description: 'Student work',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Class insights',
    },
    {
      id: 'reports',
      name: 'Reports',
      path: '/reports',
      icon: <FileBarChart className="h-5 w-5" />,
      description: 'Progress reports',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Teaching Section */}
      <div>
        <h2 className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
          {isSidebarOpen ? '📚 TEACHING' : ''}
        </h2>
        {teachingItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            data-testid={item.id === 'showcase' ? 'nav-dashboard' : item.id === 'long-range' ? 'nav-longrange' : `nav-${item.id}`}
            className={({ isActive }): string => {
              const baseClasses = `flex items-center py-3 px-4 ${!isSidebarOpen && 'justify-center'}`;
              
              if (isActive) {
                return `${baseClasses} bg-indigo-900 text-white border-l-4 border-green-400`;
              }
              
              if (item.badge === 'PRIMARY') {
                return `${baseClasses} text-white hover:bg-indigo-700 font-semibold`;
              }
              
              return `${baseClasses} text-indigo-100 hover:bg-indigo-700`;
            }}
          >
            <span className="mr-3 relative">
              {item.icon}
              {item.badge === 'PRIMARY' && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </span>
            {isSidebarOpen && (
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-indigo-300 mt-0.5">{item.description}</div>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Resources Section */}
      <div>
        <h2 className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
          {isSidebarOpen ? '📂 RESOURCES' : ''}
        </h2>
        {resourceItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }): string => {
              const baseClasses = `flex items-center py-2 px-4 ${!isSidebarOpen && 'justify-center'}`;
              
              if (isActive) {
                return `${baseClasses} bg-indigo-900 text-white`;
              }
              
              return `${baseClasses} text-indigo-200 hover:bg-indigo-700 text-sm`;
            }}
          >
            <span className="mr-3">{item.icon}</span>
            {isSidebarOpen && (
              <div className="flex-1">
                <div>{item.name}</div>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Assessment & Tracking Section */}
      <div>
        <h2 className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
          {isSidebarOpen ? '📊 ASSESSMENT & TRACKING' : ''}
        </h2>
        {assessmentItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            data-testid={`nav-${item.id}`}
            className={({ isActive }): string => {
              const baseClasses = `flex items-center py-2 px-4 ${!isSidebarOpen && 'justify-center'}`;
              
              if (isActive) {
                return `${baseClasses} bg-indigo-900 text-white border-l-4 border-yellow-400`;
              }
              
              return `${baseClasses} text-indigo-200 hover:bg-indigo-700`;
            }}
          >
            <span className="mr-3">{item.icon}</span>
            {isSidebarOpen && (
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-indigo-300 mt-0.5">{item.description}</div>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}