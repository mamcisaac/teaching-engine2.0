# Implementation Order Guide

This guide defines the execution order to maximize parallel development while avoiding conflicts.

## Phase 1: Database Foundation (Week 1)

**Agent-Atlas works alone to establish database foundation**

### Agent-Atlas Priority Tasks:

1. Multimodal Evidence (Artifact model) - CRITICAL: Many agents depend on this
2. Visual Resource Organizer (MediaResource model)
3. Teacher Collaboration models
4. SPT Export Engine

**Why:** Other agents need these models before they can start their work.

## Phase 2: Parallel Development (Weeks 2-3)

**All agents work in parallel on their core features**

### Agent-Scholar:

1. Student Profile Dashboard (uses Artifact model)
2. Student Goal Tracker
3. Learning Artifact Gallery

### Agent-Evaluator:

1. Language-Sensitive Assessment Builder
2. Outcome Reflections Journal
3. Daily Evidence Quick Entry

### Agent-Planner:

1. Activity Suggestion Engine
2. Weekly Planning Quality Scorecard
3. Outcome-Aware Activities

### Agent-Insight:

1. Curriculum Outcome Heatmap
2. Domain Strength Radar
3. Theme Analytics Dashboard

### Agent-Messenger:

1. Parent Communication Center (prep for WeeklyPlanner integration)
2. AI-Based Parent Summary
3. Family Engagement Dashboard

## Phase 3: Integration Points (Week 4)

**Careful coordination required**

### Critical Integrations:

1. **WeeklyPlanner Integration**

   - Agent-Planner: Completes base enhancements
   - Agent-Messenger: Adds parent sharing features
   - Coordinate through props interface

2. **Student Dashboard Integration**

   - Agent-Scholar: Completes main dashboard
   - Agent-Evaluator: Adds assessment widgets
   - Agent-Insight: Adds analytics widgets

3. **Outcome Management**
   - Agent-Planner: Establishes outcome structure
   - Agent-Evaluator: Adds evidence tracking
   - Agent-Insight: Adds visualization layer

## Phase 4: Advanced Features (Week 5)

**Agents complete remaining tasks**

- Agent-Atlas: Remaining models
- Agent-Scholar: Timeline and reflection features
- Agent-Evaluator: Intervention and longitudinal tracking
- Agent-Planner: Advanced planning assistance
- Agent-Insight: Vocabulary analytics
- Agent-Messenger: Report generation suite

## Coordination Checkpoints

### Daily Sync Points:

1. **Morning**: Check for new models in schema.prisma
2. **Midday**: Review any TODO comments in code
3. **Evening**: Update progress in agent logs

### Before Starting New Task:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for database updates
pnpm --filter @teaching-engine/database db:generate

# 3. Run tests to ensure stability
pnpm test

# 4. Create feature branch
git checkout -b agent-{name}/{feature}
```

### When Integration Needed:

1. Add TODO comment in code
2. Create interface definition
3. Mock the integration first
4. Coordinate timing with other agent
5. Test integration thoroughly

## Conflict Resolution

### If Conflicts Arise:

1. **Stop work immediately**
2. **Identify the conflict source**
3. **Check AGENT_COORDINATION_GUIDE.md**
4. **Communicate through TODO comments**
5. **Create a resolution plan**

### Common Conflict Scenarios:

#### Scenario 1: Need to modify shared component

**Solution:** Create wrapper component instead

```typescript
// Instead of modifying WeeklyPlanner directly
// Create WeeklyPlannerWithSharing that wraps it
export const WeeklyPlannerWithSharing = () => {
  return (
    <WeeklyPlanner
      onActivitySelect={handleShare}
      additionalToolbar={<ShareButton />}
    />
  );
};
```

#### Scenario 2: Need new database field

**Solution:** Request through Agent-Atlas

```typescript
// Add TODO comment in your code
// TODO: Agent-Atlas - need 'sharedWithParents' boolean field on Activity model
```

#### Scenario 3: Type conflicts

**Solution:** Extend interfaces

```typescript
// Instead of modifying existing interface
interface ExtendedActivity extends Activity {
  sharingMetadata?: SharingInfo;
}
```

## Success Metrics

### Week 1 Completion:

- [ ] All database models created
- [ ] Migrations run successfully
- [ ] TypeScript types generated

### Week 2-3 Completion:

- [ ] Core features implemented
- [ ] Unit tests passing
- [ ] No merge conflicts

### Week 4 Completion:

- [ ] All integrations working
- [ ] E2E tests passing
- [ ] Performance benchmarks met

### Week 5 Completion:

- [ ] All tasks completed
- [ ] Documentation updated
- [ ] Ready for production

## Emergency Procedures

### If Blocked:

1. Document the blocker clearly
2. Work on alternative tasks
3. Create mock data/services
4. Continue with testable code

### If Breaking Changes Needed:

1. Stop and reassess
2. Document the need
3. Coordinate with all agents
4. Plan migration strategy
5. Execute during quiet period

Remember: Communication prevents conflicts. When in doubt, over-communicate!
