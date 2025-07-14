import {
  BookOpen,
  Calendar,
  Plus,
  Sparkles,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Star,
  Clock,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { OnboardingTooltip } from '../components/onboarding';
import { useHelp } from '../contexts/HelpContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useRecentPlans } from '../hooks/useRecentPlans';

export default function PlanningDashboard(): React.ReactElement {
  const { startTutorial } = useHelp();
  const { resetOnboarding } = useOnboarding();
  const { data: recentPlans = [], isLoading: recentPlansLoading } = useRecentPlans({ limit: 3 });
  const [showGetStarted, setShowGetStarted] = useState(true);

  // Simplified primary actions for Grade 1 French Immersion teachers
  const primaryActions = [
    {
      id: 'start-planning',
      title: 'Commencer la planification',
      subtitle: 'Start Planning',
      description: 'Create your first lesson plan for Grade 1 French Immersion',
      icon: <Plus className="h-6 w-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/planner/quick-lesson',
      isPrimary: true,
    },
    {
      id: 'weekly-view',
      title: 'Vue hebdomadaire',
      subtitle: 'Weekly View',
      description: 'See your week at a glance and plan ahead',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      path: '/planner/calendar',
    },
    {
      id: 'ai-help',
      title: 'Aide intelligente',
      subtitle: 'Smart Help',
      description: 'Get French Immersion lesson suggestions',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/planner/quick-lesson',
    },
  ];

  // Quick access resources specific to French Immersion
  const resources = [
    {
      title: 'Communication aux parents',
      subtitle: 'Parent Newsletter',
      description: 'Generate weekly updates in French and English',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/planner/newsletter',
    },
    {
      title: 'Modèles de leçons',
      subtitle: 'Lesson Templates',
      description: 'French Immersion lesson templates',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/templates',
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold text-gray-900">Bienvenue dans Teaching Engine</h1>
          <div className="flex items-center gap-2">
            <Button
              className="gap-2 text-blue-600 hover:text-blue-700"
              size="sm"
              variant="ghost"
              onClick={() => {
 startTutorial('getting-started-tour'); 
}}
            >
              <HelpCircle className="h-4 w-4" />
              Aide
            </Button>
            <Button
              className="text-gray-500 hover:text-gray-700"
              size="sm"
              variant="ghost"
              onClick={() => {
 resetOnboarding(); 
}}
            >
              Restart Tour
            </Button>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your planning assistant for Grade 1 French Immersion • Votre assistant de planification
          pour la 1ère année d&apos;immersion française
        </p>
      </div>

      {/* Getting Started Card */}
      {showGetStarted && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Getting Started</CardTitle>
                  <CardDescription className="text-blue-700">
                    New to Teaching Engine? Start here for a quick 5-minute setup
                  </CardDescription>
                </div>
              </div>
              <Button
                className="text-blue-600 hover:text-blue-700"
                size="sm"
                variant="ghost"
                onClick={() => {
 setShowGetStarted(false); 
}}
              >
