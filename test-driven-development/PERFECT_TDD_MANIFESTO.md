# The PERFECT TDD Manifesto for Teaching Software

## What Makes TDD Perfect for Teaching Software

### 1. Tests Must Fail First (RED)
```javascript
// WRONG: Writing implementation inside test
function createNote(student, text) {
  return { student, text };
}

// RIGHT: Test that fails because function doesn't exist
const note = createNote('Emma', 'bit Liam'); // ReferenceError
```

### 2. Tests Must Reflect ACTUAL Classroom Chaos

#### ❌ Academic TDD (Wrong)
```javascript
it('should store a student note', () => {
  const note = createNote('student-1', 'observation text');
  expect(note.text).toBe('observation text');
});
```

#### ✅ Classroom Reality TDD (Right)
```javascript
it('should let me record "Emma bit Liam" in under 3 seconds while preventing further violence', () => {
  const startTime = Date.now();
  quickNote('Emma', 'BIT LIAM');
  expect(Date.now() - startTime).toBeLessThan(3000);
});
```

## The Perfect TDD Cycle for Teaching Software

### Phase 1: RED - Discover Through Panic
Write tests that capture the ACTUAL moment of need:
- Parent ambush at pickup
- Principal surprise observation
- Fire alarm during lesson
- iPad dying mid-reflection
- Supply teacher panic

### Phase 2: GREEN - Just Survive
Write the MINIMUM code to handle the crisis:
```javascript
// Just enough to not get fired
function quickNote(student, what) {
  console.log(`${student}: ${what}`); // That's it. We survived.
}
```

### Phase 3: REFACTOR - Make It Principal-Ready
Only AFTER surviving, make it proper:
- Add persistence
- Add timestamps  
- Add privacy filters
- Add custody awareness

## Real Test Scenarios That Drive Requirements

### Lesson Reflections
- ❌ "Track lesson completion" → Academic
- ✅ "Fire alarm interrupted math lesson" → Real

### Anecdotal Notes  
- ❌ "Associate notes with students" → Academic
- ✅ "Emma bit Liam, I have 2 seconds" → Real

### Progress Dashboard
- ❌ "Generate parent reports" → Academic  
- ✅ "Mom ambushed me at pickup" → Real

### Planning Cascade
- ❌ "Display hierarchical tree" → Academic
- ✅ "Principal wants butterfly lesson NOW" → Real

## The 10 Commandments of Teaching Software TDD

1. **Thou shalt write failing tests first** - No implementation in test files
2. **Thou shalt test chaos, not calm** - Fire drills, not perfect days
3. **Thou shalt measure in seconds, not features** - Speed over completeness
4. **Thou shalt test with 26 students, not 3** - Real class sizes
5. **Thou shalt test interruptions** - Nothing ever goes as planned
6. **Thou shalt test parent confrontations** - They will challenge you
7. **Thou shalt test device failures** - iPads die at worst moments
8. **Thou shalt test retroactive recording** - You'll forget until Friday
9. **Thou shalt test privacy/custody issues** - Legal requirements are real
10. **Thou shalt test supply teacher scenarios** - You will get sick

## Test Naming Convention

### ❌ Wrong: Technical/Abstract
```javascript
describe('User input validation', () => {
  it('should validate string length', () => {
```

### ✅ Right: Scenario/Moment
```javascript
describe('🔴 RED: Emma just bit Liam during circle time', () => {
  it('should let me record this in under 3 seconds while preventing further violence', () => {
```

## Coverage Metrics That Matter

### Traditional (Useless)
- Line coverage: 95% ❌
- Branch coverage: 90% ❌  
- Function coverage: 88% ❌

### Classroom Reality (Useful)
- Panic scenarios covered: 12/15 ✅
- Parent confrontations handled: 8/10 ✅
- Device failures survived: 5/5 ✅
- Supply teacher ready: Yes ✅
- Legal compliance: Yes ✅

## Example: Perfect TDD Test Evolution

### Step 1: RED - The Crisis
```javascript
describe('🔴 RED: Report cards due in 2 hours', () => {
  it('should show me who I haven\'t assessed yet', () => {
    const unassessed = panicGetUnassessed(); // FAILS - doesn't exist
    expect(unassessed.length).toBe(0); // Want zero but will fail
  });
});
```

### Step 2: GREEN - The Survival
```javascript
function panicGetUnassessed() {
  return ['Emma', 'Liam', 'Jackson']; // Hard-coded survival
}
```

### Step 3: REFACTOR - The Proper Solution
```javascript
function panicGetUnassessed() {
  return database.students
    .filter(s => !s.hasTermOneAssessment)
    .sortBy(s => s.parentComplainLikelihood); // Smart ordering
}
```

## Testing Anti-Patterns in Teaching Software

### 1. The "Happy Path" Fallacy
```javascript
// WRONG: Assumes everything works
it('should save lesson reflection', () => {
  const saved = saveReflection('Went well');
  expect(saved).toBe(true);
});
```

### 2. The "Clean Data" Delusion  
```javascript
// WRONG: Assumes proper input
it('should parse student name', () => {
  const name = parseName('Emma Johnson');
  expect(name.first).toBe('Emma');
});

// RIGHT: Test actual input
it('should parse "EMMA!!!! (shes the biter)"', () => {
  const name = parseName('EMMA!!!! (shes the biter)');
  expect(name.student).toBe('Emma');
  expect(name.warning).toBe('biter');
});
```

### 3. The "Single User" Mistake
```javascript
// WRONG: One teacher
it('should update lesson', () => {

// RIGHT: Multiple teachers, supply, EA, principal observing
it('should handle 4 adults updating same lesson simultaneously', () => {
```

## The Ultimate Test: Can Emily Use It?

Every test should answer:
1. Can Emily use this during a meltdown?
2. Can Emily use this with parents watching?
3. Can Emily use this at 7am exhausted?
4. Can Emily use this with principal behind her?
5. Can a supply use this with zero training?

If ANY answer is "no", the test is wrong.

## Commit Message Format for Perfect TDD

```
test: [RED] <actual scenario that happened>
feat: [GREEN] <minimum survival code>
refactor: [BLUE] <now make it proper>
```

Examples:
```
test: [RED] emma bit liam need quick note
feat: [GREEN] console.log for now
refactor: [BLUE] add persistence and timestamps
```

## Remember

**TDD is not about code coverage.**
**TDD is about discovering what you actually need.**

In teaching, what you need is:
- Speed over features
- Survival over perfection
- Privacy over transparency
- Chaos handling over happy paths

Write tests that would make a substitute teacher nod and say "Yes, this is what I need."

Not tests that make a developer say "Nice architecture."

## The Final Test

If your tests don't include:
- Vomit
- Fire drills  
- Parent complaints
- Device failures
- Supply teachers
- Report card panic
- Principal observations

Then you're not doing Teaching Software TDD.

You're doing Academic TDD.

And Academic TDD has never survived a Grade 1 classroom.

---

*"The best test suite is one written by someone who just survived their first week as a substitute teacher."*

*- Emily McIsaac (probably)*