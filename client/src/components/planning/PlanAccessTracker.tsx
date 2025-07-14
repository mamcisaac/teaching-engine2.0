import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useTrackPlanAccess } from '../../hooks/useRecentPlans';

interface PlanAccessTrackerProps {
  planType: 'long-range' | 'unit' | 'lesson' | 'daybook';
  children: React.ReactNode;
}

export function PlanAccessTracker({ planType, children }: PlanAccessTrackerProps): React.ReactElement {
  const params = useParams();
  const trackAccess = useTrackPlanAccess();
  
  // Get the plan ID from route params based on plan type
  const planId = (params.unitId !== null && params.unitId !== undefined && params.unitId !== '') ? params.unitId : 
    (params.lessonId !== null && params.lessonId !== undefined && params.lessonId !== '') ? params.lessonId : 
    (params.longRangePlanId !== null && params.longRangePlanId !== undefined && params.longRangePlanId !== '') ? params.longRangePlanId : 
    (params.id !== null && params.id !== undefined && params.id !== '') ? params.id : undefined;
  
  useEffect(() => {
    if (planId !== null && planId !== undefined && planId !== '') {
      // Track access when component mounts or planId changes
      trackAccess.mutate({ planType, planId });
    }
  }, [planId, planType, trackAccess]);
  
  return <>{children}</>;
}