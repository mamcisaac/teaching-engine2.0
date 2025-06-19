# Task File Updates Needed

Each task file should have the following header added at the top:

```markdown
---
Agent: [Agent-Name]
Priority: [1-15 based on README order]
Dependencies: [List any tasks that must complete first]
EstimatedTime: [Hours/Days]
---

[Original task content...]
```

## Example Headers

### For Agent-Atlas tasks:

```markdown
---
Agent: Agent-Atlas
Priority: 1
Dependencies: None
EstimatedTime: 4 hours
---
```

### For Agent-Scholar tasks that depend on Atlas:

```markdown
---
Agent: Agent-Scholar
Priority: 1
Dependencies: Agent-Atlas/Multimodal Evidence
EstimatedTime: 8 hours
---
```

### For Agent-Messenger WeeklyPlanner integration:

```markdown
---
Agent: Agent-Messenger
Priority: 4
Dependencies: Agent-Planner/Weekly Planning Quality Scorecard
EstimatedTime: 6 hours
---
```

## Quick Reference

### Dependencies to Track:

- Many features depend on Agent-Atlas/Multimodal Evidence (Artifact model)
- Agent-Messenger/Parent Communication depends on Agent-Planner/WeeklyPlanner updates
- Agent-Insight features depend on other agents having data to visualize
- Agent-Scholar SPT features can be done last in sequence

### Time Estimates:

- Simple model creation: 2-4 hours
- Complex UI component: 6-8 hours
- Full feature with tests: 2-3 days
- Integration features: 4-6 hours

This metadata will help agents understand task sequencing and plan their work effectively.
