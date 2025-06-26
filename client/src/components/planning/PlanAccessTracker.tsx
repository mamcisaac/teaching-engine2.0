import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrackPlanAccess } from '../../hooks/useRecentPlans';

interface PlanAccessTrackerProps {
  planType: 'long-range' | 'unit' | 'lesson' | 'daybook';
  children: React.ReactNode;
}

export function PlanAccessTracker({ planType, children }: PlanAccessTrackerProps) {
  const params = useParams();
  const trackAccess = useTrackPlanAccess();
  
  // Get the plan ID from route params based on plan type
  const planId = params.unitId || params.lessonId || params.longRangePlanId || params.id;
  
  useEffect(() => {
    if (planId) {
      // Track access when component mounts or planId changes
      trackAccess.mutate({ planType, planId });
    }
  }, [planId, planType, trackAccess]);
  
  return <>{children}</>;
}