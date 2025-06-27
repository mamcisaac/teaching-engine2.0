import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
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
import { useRecentPlans } from '../hooks/useRecentPlans';
import { useHelp } from '../contexts/HelpContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { OnboardingTooltip } from '../components/onboarding';

export default function PlanningDashboard() {
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
              variant="ghost"
              size="sm"
              onClick={() => startTutorial('getting-started-tour')}
              className="gap-2 text-blue-600 hover:text-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
              Aide
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetOnboarding()}
              className="text-gray-500 hover:text-gray-700"
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
                variant="ghost"
                size="sm"
                onClick={() => setShowGetStarted(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => startTutorial('getting-started-tour')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Take the Tour (5 min)
              </Button>
              <Link to="/planner/quick-lesson">
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Actions • Actions rapides</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {primaryActions.map((action) => {
            const actionCard = (
              <Link key={action.id} to={action.path} id={action.id}>
                <Card
                  className={`h-full transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
                    action.isPrimary
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-full text-white ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500 font-medium">{action.subtitle}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );

            // Add tooltips for key actions
            if (action.id === 'start-planning') {
              return (
                <OnboardingTooltip
                  key={action.id}
                  id="start-planning-tooltip"
                  title="Your First Lesson"
                  content="This is where the magic begins! Click here to create your first French Immersion lesson plan with AI assistance."
                  position="bottom"
                  actionText="Start planning"
                  onAction={() => (window.location.href = action.path)}
                >
                  {actionCard}
                </OnboardingTooltip>
              );
            } else if (action.id === 'ai-help') {
              return (
                <OnboardingTooltip
                  key={action.id}
                  id="ai-help-tooltip"
                  title="AI Teaching Assistant"
                  content="Your bilingual AI helper understands Ontario curriculum and can suggest activities in French and English."
                  position="bottom"
                >
                  {actionCard}
                </OnboardingTooltip>
              );
            }

            return actionCard;
          })}
        </div>
      </div>

      {/* Recent Plans & Quick Resources */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Plans
            </CardTitle>
            <CardDescription>Your latest lesson plans and activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : recentPlans.length > 0 ? (
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(plan.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No plans yet. Create your first lesson to get started!</p>
                <Link to="/planner/quick-lesson">
                  <Button variant="outline" className="mt-3">
                    Create First Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              French Immersion Resources
            </CardTitle>
            <CardDescription>Tools designed for Grade 1 French Immersion teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((resource) => (
                <Link
                  key={resource.path}
                  to={resource.path}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">{resource.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-500">{resource.subtitle}</p>
                      <p className="text-xs text-gray-400">{resource.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}

              {/* Quick Setup Tip */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-3">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900">Pro Tip</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Start with a quick lesson plan to see how Teaching Engine adapts to French
                      Immersion needs. The AI understands both languages!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teaching Philosophy */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Made for Prince Edward Island Educators
              </h3>
            </div>
            <p className="text-green-800 max-w-3xl mx-auto">
              Teaching Engine 2.0 is designed specifically for PEI curriculum requirements and
              French Immersion pedagogy. Focus on teaching while we handle the planning complexity.
            </p>
            <p className="text-sm text-green-700 italic">
              &ldquo;Teaching is about inspiring minds, not managing paperwork.&rdquo;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
