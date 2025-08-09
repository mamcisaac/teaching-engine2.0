# PEI Grade 1 French Immersion Curriculum Extraction Strategy

## ⚠️ CRITICAL WARNINGS - READ FIRST

### Context Overflow Prevention
**CRITICAL**: PR 2766 (1.7MB) WILL crash the context if read directly. This has been confirmed through multiple failed attempts.

**MANDATORY RULES:**
1. **NEVER** attempt to read PR 2766 PDF directly with Read or Agent tools
2. **ALWAYS** use the chunked extraction method with pre-generated prompts
3. **ALWAYS** use Task tool with individual prompt files for each subject
4. **NEVER** try to process all subjects in a single extraction

### Known Context Killers
- PR 2766 - Prog. Immersion 1re année 5.30.19.pdf (1.7MB) - MUST BE CHUNKED
- Unités transdisciplinaires 1re année (4.0MB) - MUST BE CHUNKED
- Grade 1 Health Curriculum.pdf (3.6MB) - MUST BE CHUNKED
- Any PDF over 1MB should be treated with extreme caution

### Recovery Process
When context crashes:
1. Start new conversation
2. Read EXTRACTION_SUMMARY.md first
3. Check existing extraction*.json files
4. Continue from last successful extraction
5. DO NOT attempt to read the problematic PDF again

## Executive Summary
Extracting ~68 curriculum expectations from 20 PDF documents for Grade 1 French Immersion in PEI. Currently at 66 expectations from 8 documents, with 12 documents remaining.

## Current Status Analysis

### Successfully Extracted (66 expectations from 8 documents)
| Document | Expectations | Agent | Notes |
|----------|--------------|-------|-------|
| 1re ann e TABLEAUX CUMULATIFS DES RAS.pdf | 20 | 2 | Cumulative outcome tables |
| 2019 RAFs en un coup doeil.pdf | 7 | 2 | Quick reference guide |
| Planification dunité 1.pdf | 11 | 5 | Unit 1 planning |
| Planification dunité 2.pdf | 7 | 5 | Unit 2 planning |
| Planification dunité 3.pdf | 5 | 6 | Unit 3 planning |
| Planification dunité 4.pdf | 5 | 6 | Unit 4 planning |
| Toutes les ressources 1re ann e.pdf | 0 | 8 | Resource list only |
| profil de classe 1re avec changements_3.pdf | 7 | 8 | Class profile |

### Remaining Documents (Priority Order)
1. **PR 2766 - Prog. Immersion 1re année** (1.7MB) - CRITICAL: Main program document
2. **1re année RAFs Triangulation.pdf** - Core French language expectations
3. **Grade 1 Health Curriculum.pdf** (3.6MB) - Health expectations in English
4. **K-6 Physical Education Curriculum.pdf** - PE expectations for Grade 1
5. **Mental Health Curriculum Guide.pdf** - Mental health outcomes
6. **Unités transdisciplinaires 1re année** (4.0MB) - Cross-curricular units
7. Others - Supporting documents

## Technical Challenges & Solutions

### 1. File Encoding Issues
**Problem:** Filenames show encoding issues (année → annÃ©e)
**Solution:** 
- Use exact filenames from `ls` output
- Store clean names in extraction metadata
- Handle UTF-8 properly in scripts

### 2. Context Overflow Issues (CRITICAL)
**Problem:** PR 2766 extraction ALWAYS fails due to context overflow, not just conversation length
**Root Cause:** The 1.7MB PDF overwhelms the LLM context window when read directly
**Failed Approaches:**
- Direct reading with Read tool - FAILS
- Using Agent tool to read full document - FAILS
- Attempting to extract all subjects at once - FAILS

**ONLY WORKING SOLUTION:**
- Use pre-generated prompt files (already created)
- Launch 6 parallel Task agents, one per subject
- Each agent reads ONLY its prompt file, NOT the PDF
- Merge results after all complete

### 3. Large PDF Files
**Files over 3MB:**
- Unités transdisciplinaires (4.0MB)
- Grade 1 Health Curriculum (3.6MB)
- PR 2766 (1.7MB) - failed despite smaller size

**Approach:**
- Chunked extraction by sections
- Page range specific prompts
- Multiple parallel agents

## Extraction Method Details

### Method 1: Standard Agent Extraction
```javascript
// For files < 1MB
{
  "agent": "extract-curriculum",
  "prompt": "Extract all Grade 1 curriculum expectations from [document]",
  "output": "extraction_[doc].json"
}
```

### Method 2: Chunked Extraction (PR 2766)
```javascript
// Extract by subject sections
const sections = [
  { subject: "Français", pages: "10-25" },
  { subject: "Mathématiques", pages: "26-40" },
  { subject: "Sciences", pages: "41-55" },
  { subject: "Sciences humaines", pages: "56-70" },
  { subject: "Arts", pages: "71-85" }
];

// Extract each section separately
sections.forEach(section => {
  extractSection(file, section);
  // Save as extraction_pr2766_[subject].json
});
```

### Method 3: Focused Search Extraction
```javascript
// For English documents needing Grade 1 filtering
{
  "keywords": ["Grade 1", "Grade One", "Primary", "K-1"],
  "exclude": ["Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
  "output": "extraction_[doc]_grade1.json"
}
```

## File-by-File Extraction Plan

### PR 2766 - Main Program Document (PRIORITY)
**Strategy:** Chunked by subject
**Sections to extract:**
1. Français langue première (pages TBD)
2. Mathématiques (pages TBD)
3. Sciences de la nature (pages TBD)
4. Sciences humaines (pages TBD)
5. Arts (pages TBD)
6. Formation personnelle et sociale (pages TBD)

**Expected outcomes:** ~40-50 expectations

### Grade 1 Health Curriculum
**Strategy:** Focused search for Grade 1
**Keywords:** "Grade 1", "Grade One", "Primary Health"
**Expected outcomes:** 5-10 expectations

### K-6 Physical Education
**Strategy:** Grade 1 filter
**Sections:** Look for "Grade 1" or "Primary" sections
**Expected outcomes:** 5-8 expectations

### 1re année RAFs Triangulation
**Strategy:** Standard extraction
**Focus:** French language arts expectations
**Expected outcomes:** 10-15 expectations

## Validation Checklist

### Pre-extraction
- [ ] Verify file exists and is readable
- [ ] Check file size for chunking needs
- [ ] Update status to "In Progress"

### During extraction
- [ ] Save progress after each chunk
- [ ] Track page numbers for reference
- [ ] Capture exact text from source

### Post-extraction
- [ ] Validate JSON structure
- [ ] Check for duplicates
- [ ] Verify expectation format (code, description, subject, strand)
- [ ] Update status to "Complete" or "Failed"
- [ ] Document any issues

## Recovery Points

### If extraction fails:
1. Check `extraction_*.json` files for partial data
2. Review CURRICULUM_EXTRACTION_STATUS.md for last successful state
3. Check which specific section/page failed
4. Resume from last successful chunk

### Checkpoint files:
- `CURRICULUM_EXTRACTION_STATUS.md` - Overall progress
- `extraction_agent*.json` - Previous successful extractions
- `extraction_pr2766_*.json` - Chunked extractions for main document
- `REAL-PEI-CURRICULUM-ONLY.json` - Consolidated clean data

## Expected Final Output

### Subject Distribution (Target: ~68 expectations)
- Français langue première: ~15
- Mathématiques: ~20
- Sciences de la nature: ~10
- Sciences humaines: ~8
- Arts (all disciplines): ~10
- English Language Arts: ~5
- Éducation physique: ~5
- Santé: ~5
- Formation personnelle et sociale: ~8

### JSON Structure
```json
{
  "metadata": {
    "grade": 1,
    "province": "Prince Edward Island",
    "language": "French Immersion",
    "extractionDate": "2025-08-08",
    "totalExpectations": 68
  },
  "curriculum": {
    "[subject]": [
      {
        "code": "XX#",
        "description": "Full expectation text",
        "subject": "Subject name",
        "strand": "Strand/domain",
        "source": "Document name, page #",
        "examples": "Optional examples or indicators"
      }
    ]
  }
}
```

## Command Reference

### Check file encoding
```bash
ls -la resources/PE_Grade1_Fr/ | grep "PR 2766"
```

### Monitor extraction progress
```bash
ls -la extraction*.json | wc -l
```

### Count total expectations
```bash
cat extraction*.json | jq '.expectations | length' | paste -sd+ | bc
```

### Merge all extractions
```bash
node scripts/merge-extractions.js
```

## Troubleshooting Guide

### Common Issues

1. **"Cannot find module" error**
   - Check file path encoding
   - Use exact filename from ls output

2. **"Conversation too long" error**
   - Reduce prompt size
   - Extract smaller chunks
   - Use /compact command

3. **"PDF read error"**
   - Check file permissions
   - Try alternate PDF reader
   - Extract as images if needed

4. **Duplicate expectations**
   - Check extraction source
   - Compare codes and descriptions
   - Keep most detailed version

## Success Criteria

✅ All 20 documents processed (extracted or marked as non-curriculum)
✅ ~68 unique expectations identified
✅ All subjects have appropriate coverage
✅ Each expectation has complete metadata
✅ No fabricated or assumed content
✅ All data verified against source documents
✅ Successfully imported to database
✅ Application can filter by selected subjects

## Notes for Future Attempts

- Start with smaller test extraction before full document
- Save frequently to avoid losing progress
- Use parallel agents for independent documents
- Keep conversation focused on single extraction task
- Document page numbers for manual verification
- PR 2766 is the most critical document - prioritize its extraction