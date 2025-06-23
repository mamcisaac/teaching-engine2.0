# ETFO Migration Strategy

## Overview
This document outlines the strategy for migrating Teaching-Engine 2.0 from the legacy Milestone/Activity model to the new ETFO-aligned 5-level planning hierarchy.

## Migration Phases

### Phase 1: Parallel Implementation (CURRENT)
- ✅ New ETFO models created alongside existing models
- ✅ No breaking changes to existing functionality
- ✅ Users continue using the system normally

### Phase 2: Data Migration Scripts
Create scripts to transform existing data:

#### 2.1 Outcome → CurriculumExpectation
```typescript
// Migration logic:
// 1. For each Outcome, create a CurriculumExpectation
// 2. Map fields:
//    - outcome.code → curriculumExpectation.code
//    - outcome.description → curriculumExpectation.description
//    - outcome.domain → curriculumExpectation.strand
//    - outcome.subject → curriculumExpectation.subject
//    - outcome.grade → curriculumExpectation.grade
// 3. Preserve relationships for later mapping
```

#### 2.2 Milestone → UnitPlan
```typescript
// Migration logic:
// 1. Create a default LongRangePlan for each user/subject/year combination
// 2. For each Milestone, create a UnitPlan
// 3. Map fields:
//    - milestone.title → unitPlan.title
//    - milestone.description → unitPlan.description
//    - milestone.startDate → unitPlan.startDate
//    - milestone.endDate → unitPlan.endDate
//    - milestone.estHours → unitPlan.estimatedHours
// 4. Link to appropriate LongRangePlan
// 5. Map MilestoneOutcome relationships to UnitPlanExpectation
```

#### 2.3 Activity → ETFOLessonPlan
```typescript
// Migration logic:
// 1. For each Activity, create an ETFOLessonPlan
// 2. Map fields:
//    - activity.title → etfoLessonPlan.title
//    - activity.durationMins → etfoLessonPlan.duration
//    - activity.privateNote → etfoLessonPlan.subNotes (if isSubFriendly)
//    - activity.publicNote → etfoLessonPlan.action
//    - activity.materialsText → etfoLessonPlan.materials (as JSON array)
// 3. Link to parent UnitPlan
// 4. Map ActivityOutcome relationships to ETFOLessonPlanExpectation
// 5. Create DaybookEntry for completed activities
```

### Phase 3: Feature Flag Rollout
1. Add feature flag: `ETFO_PLANNING_ENABLED`
2. Implement dual-read capability:
   - API endpoints check feature flag
   - If enabled, use new models
   - If disabled, use legacy models
3. Gradual rollout:
   - Start with 5% of users
   - Monitor for issues
   - Increase to 25%, 50%, 100%

### Phase 4: UI Migration
1. Create new React components:
   - `LongRangePlanView`
   - `UnitPlanBuilder`
   - `ETFOLessonPlanEditor`
   - `DaybookReflection`
2. Update routing:
   - `/planner/long-range` → Long-range planning
   - `/planner/units` → Unit planning
   - `/planner/lessons` → Lesson planning
   - `/planner/daybook` → Daily reflections
3. Maintain backward compatibility with URL redirects

### Phase 5: Data Validation
1. Run validation scripts to ensure:
   - All milestones have corresponding unit plans
   - All activities have corresponding lesson plans
   - All outcomes have corresponding curriculum expectations
   - No orphaned relationships
2. Generate migration report for each user
3. Allow manual correction of any issues

### Phase 6: Legacy Code Removal
1. Once all users migrated:
   - Remove Milestone model and related code
   - Remove Activity model and related code
   - Remove old API endpoints
   - Remove old React components
2. Clean up database:
   - Drop legacy tables
   - Remove unused indexes
   - Optimize new table indexes

## Rollback Strategy
1. Keep legacy tables during entire migration
2. Maintain dual-write capability if needed
3. Database snapshots before each phase
4. Ability to switch feature flag off instantly
5. Automated rollback scripts ready

## Success Metrics
- Zero data loss
- < 1% error rate during migration
- User satisfaction maintained or improved
- Performance metrics equal or better
- All automated tests passing

## Timeline
- Week 1-2: Migration scripts development and testing
- Week 3-4: Feature flag implementation
- Week 5-8: Gradual rollout
- Week 9-10: UI migration
- Week 11-12: Validation and cleanup
- Week 13: Legacy code removal

## Risk Mitigation
1. **Data Loss**: Complete backups before each phase
2. **Performance**: Load test new models with production data
3. **User Confusion**: Clear communication and training materials
4. **Integration Issues**: Comprehensive integration testing
5. **Rollback Complexity**: Practice rollback procedures

## Next Steps
1. Create detailed migration scripts
2. Set up feature flag infrastructure
3. Create comprehensive test suite
4. Prepare user communication plan
5. Schedule migration phases