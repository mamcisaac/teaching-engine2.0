import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWorkflowState, ETFOLevel, ETFO_LEVEL_PATHS } from '../hooks/useWorkflowState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { Button } from './ui/Button';
import { LockIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface WorkflowGateProps {
  level: ETFOLevel;
  children: React.ReactNode;
}

export default function WorkflowGate({ level, children }: WorkflowGateProps) {
  const { workflowState, isLevelAccessible, getBlockedReason, getLevelProgress, getPreviousLevel } = useWorkflowState();
  const location = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (workflowState) {
      setIsChecking(false);
      
      // Show toast if blocked
      if (!isLevelAccessible(level)) {
        const blockedReason = getBlockedReason(level);
        toast({
          title: 'Access Restricted',
          description: blockedReason || 'You must complete previous levels first',
          variant: 'destructive',
        });
      }
    }
  }, [workflowState, level, isLevelAccessible, getBlockedReason, toast]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If level is accessible, render children
  if (isLevelAccessible(level)) {
    return <>{children}</>;
  }

  // Otherwise, show blocked message
  const blockedReason = getBlockedReason(level);
  const levelProgress = getLevelProgress(level);
  const previousLevel = getPreviousLevel(level);
  const previousLevelProgress = previousLevel ? getLevelProgress(previousLevel) : null;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <LockIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                This planning level is not yet available
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Why is this locked?</AlertTitle>
            <AlertDescription>
              {blockedReason || 'You must complete the previous planning levels before accessing this one.'}
            </AlertDescription>
          </Alert>

          {previousLevel && previousLevelProgress && (
            <div className="space-y-3">
              <h3 className="font-semibold">Previous Level Progress</h3>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getLevelName(previousLevel)}</span>
                  <span className="text-sm text-muted-foreground">
                    {previousLevelProgress.completedItems} / {previousLevelProgress.totalItems} completed
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${previousLevelProgress.progressPercentage}%` }}
                  />
                </div>
                {previousLevelProgress.isComplete ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completed!</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete this level to unlock {getLevelName(level)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">How to Unlock</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              {getUnlockSteps(level).map((step, index) => (
                <li key={index} className="text-muted-foreground">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            {previousLevel && (
              <Button
                onClick={() => window.location.href = ETFO_LEVEL_PATHS[previousLevel]}
                className="flex-1"
              >
                Go to {getLevelName(previousLevel)}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getLevelName(level: ETFOLevel): string {
  const names = {
    [ETFOLevel.CURRICULUM_EXPECTATIONS]: 'Curriculum Expectations',
    [ETFOLevel.LONG_RANGE_PLANS]: 'Long-Range Plans',
    [ETFOLevel.UNIT_PLANS]: 'Unit Plans',
    [ETFOLevel.LESSON_PLANS]: 'Lesson Plans',
    [ETFOLevel.DAYBOOK_ENTRIES]: 'Daybook Entries',
  };
  return names[level] || level;
}

function getUnlockSteps(level: ETFOLevel): string[] {
  const steps = {
    [ETFOLevel.CURRICULUM_EXPECTATIONS]: [
      'This is the first level and is always accessible',
      'Import curriculum expectations to get started',
    ],
    [ETFOLevel.LONG_RANGE_PLANS]: [
      'Import at least one curriculum expectation',
      'Navigate to Curriculum Expectations',
      'Click "Import Curriculum" to add expectations',
    ],
    [ETFOLevel.UNIT_PLANS]: [
      'Create at least one long-range plan',
      'Add goals to your long-range plan',
      'Save the plan with all required fields',
    ],
    [ETFOLevel.LESSON_PLANS]: [
      'Create at least one unit plan',
      'Add big ideas to your unit plan',
      'Link curriculum expectations to the unit',
      'Save the unit plan with all required fields',
    ],
    [ETFOLevel.DAYBOOK_ENTRIES]: [
      'Create at least one lesson plan',
      'Add learning goals and materials',
      'Define activities for the lesson',
      'Save the lesson plan with all required fields',
    ],
  };
  return steps[level] || ['Complete the previous planning level'];
}