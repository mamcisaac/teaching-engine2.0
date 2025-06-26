import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  ArrowRight, 
  // ArrowDown, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Target,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ExpectationCoverage {
  expectationId: string;
  code: string;
  description: string;
  subject: string;
  strand: string;
  grade: number;
  coveredBy: Array<{
    id: string;
    title: string;
    type: 'long-range' | 'unit' | 'lesson' | 'daybook';
    date?: string;
    status: 'planned' | 'in-progress' | 'completed';
  }>;
}

interface ExpectationFlowVisualizationProps {
  expectations: ExpectationCoverage[];
  currentLevel: 'long-range' | 'unit' | 'lesson' | 'daybook';
  currentPlanId?: string;
  onNavigate?: (type: string, id: string) => void;
  showCoverageWarnings?: boolean;
  className?: string;
}

export function ExpectationFlowVisualization({
  expectations,
  currentLevel,
  currentPlanId,
  onNavigate,
  showCoverageWarnings = true,
  className = '',
}: ExpectationFlowVisualizationProps) {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'long-range':
        return <Calendar className="h-4 w-4" />;
      case 'unit':
        return <BookOpen className="h-4 w-4" />;
      case 'lesson':
        return <Target className="h-4 w-4" />;
      case 'daybook':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getLevelTitle = (level: string) => {
    switch (level) {
      case 'long-range':
        return 'Long-Range Plan';
      case 'unit':
        return 'Unit Plan';
      case 'lesson':
        return 'Lesson Plan';
      case 'daybook':
        return 'Daybook Entry';
      default:
        return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'planned':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Group expectations by coverage status
  const coveredExpectations = expectations.filter(exp => exp.coveredBy.length > 0);
  const uncoveredExpectations = expectations.filter(exp => exp.coveredBy.length === 0);

  // Calculate coverage statistics
  const totalExpectations = expectations.length;
  const coveragePercentage = totalExpectations > 0 
    ? Math.round((coveredExpectations.length / totalExpectations) * 100)
    : 0;

  const planningLevels = ['long-range', 'unit', 'lesson', 'daybook'];
  const _currentLevelIndex = planningLevels.indexOf(currentLevel);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Coverage Summary */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Curriculum Expectation Coverage
          </CardTitle>
          <CardDescription>
            Track how curriculum expectations flow through your planning levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">
                {coveragePercentage}%
              </div>
              <div className="text-sm text-gray-600">
                {coveredExpectations.length} of {totalExpectations} expectations covered
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {coveredExpectations.length} Covered
              </Badge>
              {uncoveredExpectations.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  {uncoveredExpectations.length} Uncovered
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${coveragePercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Planning Level Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-purple-500" />
            Planning Flow
          </CardTitle>
          <CardDescription>
            How expectations flow from long-range planning to daily implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {planningLevels.map((level, index) => (
              <React.Fragment key={level}>
                <div className={cn(
                  'flex flex-col items-center p-3 rounded-lg border transition-colors',
                  currentLevel === level 
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                )}>
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full mb-2',
                    currentLevel === level 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  )}>
                    {getLevelIcon(level)}
                  </div>
                  <span className="text-sm font-medium text-center">
                    {getLevelTitle(level)}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {coveredExpectations.filter(exp => 
                      exp.coveredBy.some(plan => plan.type === level)
                    ).length} expectations
                  </span>
                </div>
                
                {index < planningLevels.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Expectation List */}
      {coveredExpectations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Covered Expectations</CardTitle>
            <CardDescription>
              Expectations that are addressed in your planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coveredExpectations.map((expectation) => (
                <div key={expectation.expectationId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {expectation.code}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {expectation.strand}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {expectation.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium text-gray-600">Covered by:</span>
                    <div className="flex gap-1 flex-wrap">
                      {expectation.coveredBy.map((plan, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate?.(plan.type, plan.id)}
                          className={cn(
                            'h-6 px-2 text-xs gap-1',
                            getStatusColor(plan.status),
                            plan.id === currentPlanId ? 'ring-2 ring-blue-300' : ''
                          )}
                        >
                          {getLevelIcon(plan.type)}
                          {plan.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uncovered Expectations Warning */}
      {showCoverageWarnings && uncoveredExpectations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Uncovered Expectations
            </CardTitle>
            <CardDescription className="text-yellow-700">
              These curriculum expectations need to be addressed in your planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uncoveredExpectations.slice(0, 5).map((expectation) => (
                <div key={expectation.expectationId} className="flex items-start gap-3 p-3 bg-white rounded border">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {expectation.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {expectation.strand}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {expectation.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {uncoveredExpectations.length > 5 && (
                <p className="text-sm text-yellow-700 text-center py-2">
                  ... and {uncoveredExpectations.length - 5} more uncovered expectations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}