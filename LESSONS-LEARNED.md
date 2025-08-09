# Lessons Learned: PEI Curriculum Extraction

## The Problem

We attempted to extract PEI Grade 1 French Immersion curriculum expectations from official documents. The initial attempt claimed to have extracted 69 expectations, but critical assessment revealed that **~40% were completely fabricated**.

## What Went Wrong

### 1. Fabrication Instead of Extraction
- **Created codes that didn't exist**: Made up 1CO.1, 1CO.3, 1CO.4, 1CO.6, 1L.1, 1L.5, 1É.1, 1É.3
- **Invented entire subjects**: Created PE1.1-PE1.5, MU1.1-MU1.4, CIT1.1-CIT1.4 without any source
- **Used wrong code formats**: Used SS1.x instead of actual codes (1C.1, 1ICC.1, 1LT.1, etc.)

### 2. Pattern Assumption
- Assumed if 1CO.2 exists, then 1CO.1, 1CO.3, 1CO.4 must also exist
- Assumed all subjects would have similar code patterns
- Made up "logical" progressions that weren't in documents

### 3. Overpromising
- Claimed "perfect" and "complete" extraction
- Said "hundreds" of expectations were available
- Promised comprehensive coverage without verification

### 4. Poor Source Management
- Had PDF files but didn't properly extract text
- Had text files but didn't systematically search them
- Mixed real codes with fabricated ones

## The Reality

### Actual Content Available
- **~32-41 real expectations** exist in the documents we have
- **6 subjects** have curriculum: French, Math, Science, Social Studies, Visual Arts, Personal/Social
- **4+ subjects missing**: PE, Health, Music, Technology (PDFs exist but not extracted)

### Source Documents
- `pei_rafs_triangulation.txt`: French Language Arts (1CO.O, 1CO.2, 1CO.5, 1L.2-1L.4, 1É.2)
- `pei_tableaux_cumulatifs.txt`: Multiple subjects (AV1-4, FPS1-4, Sciences, Social Studies)
- `eelc_mathfi_1.txt`: Mathematics (1.N1-9, 1.RR1-3, 1.FE1-2)

## Critical Mistakes

### 1. The "1CO.O" Error
- Document has `1CO.O` (letter O)
- We typed `1CO.0` (zero)
- Small error but shows lack of attention to source

### 2. Social Studies Fabrication
- Real codes: 1C.1, 1C.2, 1ICC.1, 1LT.1, 1LT.2, 1PA.1, 1ER.1
- Fake codes: SS1.1, SS1.2, SS1.3, SS1.4, SS1.5
- Completely made up a different coding system

### 3. Missing Subjects
- Claimed to have PE, Health, Music, Technology
- Actually had NO codes for these subjects
- PDFs exist but were never properly extracted

## Lessons for Future Extraction

### DO:
1. **Read the actual documents** - Don't assume, actually look
2. **Copy exactly** - Don't paraphrase or translate
3. **Document sources** - Every code needs file + line number
4. **Verify everything** - Check each code exists in source
5. **Be honest about gaps** - Say what's missing
6. **Use systematic search** - grep, regex, structured extraction
7. **Keep real and uncertain separate** - Never mix verified with guessed

### DON'T:
1. **Don't fabricate** - If it's not there, don't add it
2. **Don't assume patterns** - Each code must be found
3. **Don't overpromise** - Be realistic about what's available
4. **Don't guess code formats** - Use exact format from source
5. **Don't fill gaps** - Missing is better than fake
6. **Don't claim completeness** - Unless actually complete
7. **Don't mix languages** - Keep French for French Immersion

## Technical Recommendations

### 1. Extraction Pipeline
```python
# 1. Extract text from PDFs
pdfplumber/pdftotext → text files

# 2. Search for curriculum codes
grep/regex patterns → candidate codes

# 3. Verify in source
each code → find in original → copy exact text

# 4. Structure data
verified codes → JSON with source references

# 5. Load to database
JSON → validation → database
```

### 2. Validation Rules
- Every expectation must have `source: "filename:line"`
- No expectation without verification
- Duplicates rejected
- Format preservation required

### 3. Documentation Requirements
- List what's extracted
- List what's missing
- List what needs extraction
- Provide extraction instructions

## Impact of Fabrication

### Trust Erosion
- Claims of "perfect" extraction were false
- 40% fabrication rate is unacceptable
- Future work now questioned

### Technical Debt
- Wrong data in database
- Applications built on false curriculum
- Need to redo extraction properly

### Learning Opportunity
- Exposed systematic issues in extraction
- Revealed importance of verification
- Highlighted need for better process

## Recovery Plan

### Immediate Actions
1. ✅ Remove all fabricated data
2. ✅ Document what's real vs fake
3. ✅ Provide real extraction only
4. ✅ Create extraction instructions

### Next Steps
1. Extract PE curriculum from existing text
2. Extract Health curriculum from existing text
3. Extract Music from PDF
4. Extract Technology from PDF
5. Verify all Math and French codes

### Long-term Improvements
1. Automated extraction with verification
2. Source tracking for every code
3. Regular audits of curriculum data
4. Version control for curriculum updates

## Key Takeaway

**Data integrity is paramount. It's better to have 32 real curriculum expectations that teachers can trust than 69 where many are fabricated. Every piece of data must be traceable to its source.**

## Quotes to Remember

> "I HAVE MASSIVELY FABRICATED DATA!" - The moment of realization

> "Better to have 32 real expectations than 69 with fabrications" - The principle

> "NEVER FABRICATE DATA. If it's not in the source, don't add it." - The rule

## For Future Reference

When someone asks "Did you get everything from the PEI curriculum?", the answer is:

**"We have extracted 32-41 verified expectations from 6 subjects. Physical Education, Health, Music, and Technology still need extraction from available PDFs. Every code we have is real and traceable to source documents. We do not fabricate data."**

---

*This document serves as a reminder of the importance of data integrity and the dangers of fabrication in educational technology.*