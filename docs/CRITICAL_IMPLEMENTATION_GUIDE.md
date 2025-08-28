# 🚨 CRITICAL IMPLEMENTATION GUIDE FOR NEXT AGENT

## ⚠️ STOP! READ THIS FIRST

**DO NOT**:
- Write more documentation
- Create more tracking files  
- Make grandiose claims
- Spend time on non-critical features

**DO**:
- Fix the actual broken features
- Test each fix immediately
- Implement core missing features
- Focus on teacher workflows

## 🔴 THE BRUTAL TRUTH

### What Previous Agent Actually Did
- Fixed 1 word in artifacts.ts (transaction isolation)
- Fixed 3 field names in reportGenerator.ts  
- Created 3 documentation files
- **That's it. 10 minutes of actual work.**

### What's STILL Broken
1. **File uploads** - All of them fail
2. **Mastery tracking** - Doesn't exist at all
3. **Evidence triangulation** - Not implemented
4. **Document processor** - Empty shell
5. **Video processor** - Empty shell
6. **Storage enforcement** - Not enforced
7. **Duplicate detection** - Not enforced

## 🎯 PRIORITY 1: Fix Upload Issue (15 minutes)

### The Problem
Upload expects field `document` but something in the validation chain is wrong.

### Debug Steps
```bash
# 1. Test current state
curl -X POST http://localhost:3000/api/artifacts/upload/document \
  -F "document=@/tmp/test.txt" \
  -F "studentId=cmeul4tci0005vjvx6gqtseya" \
  -F "title=Test" \
  -F "description=Test"

# 2. Check the exact error in logs
# Look for validation errors, not field name errors
```

### Likely Issues
1. Missing required fields in validation
2. Student validation failing
3. File size/type validation failing

### The Fix
Check `/server/src/middleware/upload/index.ts` - the validation chains might be the issue, not field names.

## 🎯 PRIORITY 2: Implement Mastery Tracking (2 hours)

### Create NEW File
`/server/src/routes/mastery.ts`

```typescript
import { Router } from 'express';
const router = Router();

// GET /api/mastery/student/:id
router.get('/student/:id', async (req, res) => {
  const progress = await prisma.studentOutcomeProgress.findMany({
    where: { studentId: req.params.id }
  });
  res.json(progress);
});

// POST /api/mastery
router.post('/', async (req, res) => {
  const { studentId, outcomeId, level, evidence } = req.body;
  const progress = await prisma.studentOutcomeProgress.upsert({
    where: { 
      studentId_outcomeId: { studentId, outcomeId }
    },
    update: { 
      currentLevel: level,
      lastAssessmentDate: new Date()
    },
    create: {
      studentId,
      outcomeId,
      currentLevel: level,
      userId: req.user.id
    }
  });
  res.json(progress);
});

export { router };
```

### Mount in index.ts
```typescript
import { router as masteryRoutes } from './routes/mastery';
app.use('/api/mastery', authenticate, masteryRoutes);
```

## 🎯 PRIORITY 3: Complete Document Processor (1 hour)

### File: `/server/src/services/queues/processors/documentProcessor.ts`

```typescript
import pdf from 'pdf-parse';

export const processDocumentJob = async (job) => {
  const { buffer, artifactId } = job.data;
  
  // Convert base64 to buffer
  const pdfBuffer = Buffer.from(buffer, 'base64');
  
  // Extract text
  const data = await pdf(pdfBuffer);
  
  // Update artifact with extracted text
  await prisma.studentArtifact.update({
    where: { id: artifactId },
    data: {
      textContent: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info
      }
    }
  });
  
  return { pages: data.numpages, textLength: data.text.length };
};
```

## 🎯 PRIORITY 4: Fix Storage Enforcement (30 minutes)

### Add to artifacts.ts BEFORE upload
```typescript
// Check quota before accepting upload
const quota = await checkStudentQuota(studentId, userId);
const fileSize = req.file.size;

if (quota.totalBytes + fileSize > QUOTA_BYTES) {
  return res.status(413).json({ 
    error: 'Storage quota exceeded',
    current: quota.totalBytes,
    limit: QUOTA_BYTES
  });
}
```

## 📊 REALISTIC COMPLETION METRICS

| Task | Time Estimate | Impact | Priority |
|------|--------------|--------|----------|
| Fix uploads | 15 min | Enables all file features | CRITICAL |
| Mastery API | 2 hours | Core assessment feature | CRITICAL |
| Document processor | 1 hour | Enables PDF handling | HIGH |
| Storage enforcement | 30 min | Prevents overflow | HIGH |
| Video processor | 2 hours | Nice to have | LOW |
| Duplicate detection | 1 hour | Storage optimization | LOW |

## ⚠️ TESTING COMMANDS - USE THESE

### After Each Fix
```bash
# Test upload (after fix)
curl -X POST http://localhost:3000/api/artifacts/upload/document \
  -F "document=@test.pdf" \
  -F "studentId=cmeul4tci0005vjvx6gqtseya" \
  -F "title=Test Doc"

# Test mastery (after implementing)
curl -X POST http://localhost:3000/api/mastery \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "cmeul4tci0005vjvx6gqtseya",
    "outcomeId": "MATH-1-COUNT",
    "level": "MEETING",
    "evidence": "Counted to 10 correctly"
  }'

# Test quota enforcement
# Create large file first
dd if=/dev/zero of=large.pdf bs=1M count=10
curl -X POST http://localhost:3000/api/artifacts/upload/document \
  -F "document=@large.pdf" \
  -F "studentId=cmeul4tci0005vjvx6gqtseya"
```

## 🔴 DO NOT MOVE ON UNTIL

1. ✅ File upload works (test it!)
2. ✅ Mastery tracking works (test it!)
3. ✅ Document processor extracts text (test it!)
4. ✅ Storage quota blocks large files (test it!)

## 📈 Success Metrics

You are successful when:
- Teacher can upload a PDF of student work
- Teacher can set mastery level for that work
- System extracts text from the PDF
- System prevents uploads over 5GB quota

## 🚫 What NOT to Do

- Don't create more models or schemas
- Don't refactor working code
- Don't add features not listed above
- Don't write tests until features work
- Don't create more documentation

## 💡 Final Advice

The system is 90% infrastructure, 10% features. The infrastructure works. Build the features. Teachers need:
1. Upload student work ← THIS
2. Track mastery ← THIS  
3. See progress ← THIS

Everything else is noise.

**Time to actual teacher value: 4 hours of focused work**

Stop documenting. Start coding. Test everything.

---
*This is the only documentation you need. Ignore all others.*
*Focus on the 4 priorities above. Nothing else matters.*