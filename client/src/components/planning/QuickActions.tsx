import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Upload, 
  Copy, 
  Calendar,
  BookOpen,
  GraduationCap,
  FileText,
  Sparkles,
  BookTemplate,
  Download,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  isNew?: boolean;
  requiresSetup?: boolean;
}

interface QuickActionsProps {
  onDuplicatePlan?: (planType: string) => void;
  className?: string;
}

export function QuickActions({ onDuplicatePlan, className }: QuickActionsProps) {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'import-curriculum',
      title: 'Import Curriculum',
      description: 'Upload PDF/DOCX files',
      icon: <Upload className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
      onClick: () => navigate('/curriculum/import'),
    },
    {
      id: 'create-unit',
      title: 'New Unit Plan',
      description: 'Start from scratch or template',
      icon: <Plus className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
      onClick: () => navigate('/planner/units'),
    },
    {
      id: 'quick-lesson',
      title: 'Quick Lesson',
      description: 'Standalone lesson plan',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100 hover:bg-green-200',
      onClick: () => navigate('/planner/quick-lesson'),
      isNew: true,
    },
    {
      id: 'create-lesson',
      title: 'Unit Lesson',
      description: 'Lesson within unit plan',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200',
      onClick: () => navigate('/planner/etfo-lessons'),
    },
    {
      id: 'duplicate-plan',
      title: 'Duplicate Plan',
      description: 'Copy existing plans',
      icon: <Copy className="h-5 w-5" />,
      color: 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200',
      onClick: () => onDuplicatePlan?.('select'),
    },
    {
      id: 'weekly-view',
      title: 'Weekly Planner',
      description: 'View & edit week at a glance',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-100 hover:bg-orange-200',
      onClick: () => navigate('/planner/weekly'),
    },
    {
      id: 'templates',
      title: 'Browse Templates',
      description: 'Community & ETFO templates',
      icon: <BookTemplate className="h-5 w-5" />,
      color: 'text-pink-600 bg-pink-100 hover:bg-pink-200',
      onClick: () => navigate('/templates'),
      isNew: true,
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'Get planning suggestions',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
      onClick: () => navigate('/planner/ai-assistant'),
    },
    {
      id: 'parent-newsletter',
      title: 'Parent Newsletter',
      description: 'Generate weekly updates',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-teal-600 bg-teal-100 hover:bg-teal-200',
      onClick: () => navigate('/planner/newsletter'),
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common planning tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg transition-all',
                'hover:scale-105 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              )}
            >
              {action.isNew && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
              <div className={cn('p-3 rounded-lg', action.color)}>
                {action.icon}
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Batch Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planner/export')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Plans
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planner/share')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Share with Team
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planner/print')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Print Plans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}