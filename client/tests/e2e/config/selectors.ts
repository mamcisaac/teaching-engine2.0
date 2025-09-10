export const S = {
  week: {
    grid: '[data-testid="week-view-grid"]',
    lessonCard: (id: number|string) => `[data-testid="lesson-card"][data-lesson-id="${id}"]`,
    anyLessonCard: '[data-testid="lesson-card"]',
  },
  day: {
    column: (iso: string) => `[data-testid="day-col"][data-date="${iso}"]`,
    anyLessonCard: '[data-testid="day-lesson-card"]',
  },
  detail: {
    page: '[data-testid="lesson-detail"]',
    title: '[data-testid="lesson-title"]',
    part: (name: 'mindsOn'|'action'|'consolidation') => `[data-testid="part-${name}"]`,
    diffList: '[data-testid="diff-list"]',
    hooks: {
      vocabulary: '[data-testid="hooks-vocabulary"]',
      visuals: '[data-testid="hooks-visuals"]',
      movement: '[data-testid="hooks-movement"]',
    },
    assessBtn: '[data-testid="assess-button"]',
  },
  assess: {
    page: '[data-testid="assessment-page"]',
    header: '[data-testid="assessment-header"]',
    grid: '[data-testid="assessment-grid"]',
    firstStudentCell: '[data-testid="student-row"]:nth-of-type(1) [data-testid="mark-cell"]',
    saveBtn: '[data-testid="save-assessment"]',
    toast: '[data-testid="toast-success"]',
  },
  curriculum: {
    page: '[data-testid="curriculum-page"]',
    filterGrade: '[data-testid="filter-grade"]',
    filterSubject: '[data-testid="filter-subject"]',
    listRows: '[data-testid="expectation-row"]',
    coveredToggle: '[data-testid="toggle-show-covered"]',
    coverageBadge: '[data-testid="coverage-badge"]',
  },
  cascade: {
    page: '[data-testid="planning-cascade"]',
    node: '[data-testid="cascade-node"]',
  },
  unit: {
    newBtn: '[data-testid="create-unit"]',
    titleInput: '[data-testid="unit-title"]',
    hoursInput: '[data-testid="unit-hours"]',
    distributeBtn: '[data-testid="distribute-lessons"]',
    toast: '[data-testid="toast-success"]',
  },
  nav: {
    week: 'a[href="/planner/week"]',
    today: 'a[href="/planner/today"]',
    cascade: 'a[href="/planning-overview"]',
    curriculum: 'a[href="/curriculum"]',
  }
};