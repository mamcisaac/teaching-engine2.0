# Data Integrity Incident Report - 2025-08-08

## Executive Summary
A critical data integrity failure occurred during curriculum extraction where AI agents generated 53 synthetic curriculum expectations without accessing source documents. This contaminated the educational database with fabricated data that could have been used to teach real students.

## Incident Timeline

### Initial Attempt
- **Time**: ~20:00 UTC
- **Action**: Attempted to extract PR 2766 curriculum document using parallel Task agents
- **Issue**: Agents were given extraction prompts but explicitly told NOT to read the PDF due to context overflow concerns

### Synthetic Data Generation
- **Time**: ~20:28 UTC
- **Result**: 6 Task agents generated synthetic data:
  - Français langue première: 7 fake expectations
  - Mathématiques: 20 fake expectations
  - Sciences de la nature: 5 fake expectations
  - Sciences humaines: 7 fake expectations
  - Arts: 10 fake expectations
  - Formation personnelle et sociale: 4 fake expectations
  - **Total**: 53 synthetic curriculum expectations

### Detection
- **Time**: ~20:35 UTC
- **Discovery**: Critical assessment revealed agents had no mechanism to access actual PDF content
- **Evidence**: Agents cited incorrect sources and generated plausible-looking but fake data

### Remediation
- **Time**: ~20:40-23:00 UTC
- **Actions Taken**:
  1. Deleted all 6 synthetic extraction files
  2. Deleted contaminated merged file
  3. Re-merged only legitimate data (48 real expectations)
  4. Updated all documentation to reflect true state
  5. Installed pdf-parse npm package
  6. Created working PDF text extraction script
  7. Successfully extracted PR 2766 into processable chunks

## Root Cause Analysis

### Primary Cause
**Flawed extraction strategy**: Attempted to avoid context overflow by having agents work with prompts instead of source material.

### Contributing Factors
1. **Context limitations**: 1.7MB PDF causes LLM context overflow when read directly
2. **Misaligned instructions**: Agents were told to extract from a document they couldn't access
3. **AI hallucination**: Agents generated plausible data when source was unavailable
4. **Lack of verification**: No immediate validation that data came from actual source

## Impact Assessment

### Data Integrity
- **Severity**: CRITICAL
- **Scope**: 53 fabricated curriculum expectations
- **Duration**: ~40 minutes before detection
- **Potential Impact**: Could have been used to plan lessons for real students

### System Trust
- Demonstrated that AI agents will fabricate educational data when sources are unavailable
- Highlighted need for strict verification protocols
- Exposed vulnerability in extraction pipeline

## Lessons Learned

### 1. Never Trust Without Verification
- AI agents WILL generate synthetic data if they don't have access to sources
- Always verify that extracted data can be traced to source documents
- Implement checksums or validation against known patterns

### 2. Fail Loudly, Not Plausibly
- Agents should refuse to proceed when source material is unavailable
- Better to have missing data than synthetic data
- Clear error messages prevent false confidence

### 3. Context Overflow Requires Alternative Solutions
- Large PDFs cannot be processed directly by LLMs
- Must use intermediate extraction tools (pdf-parse, OCR, etc.)
- Text chunking is essential for large documents

### 4. Documentation Is Critical
- Incident was caught through critical self-assessment
- Clear documentation helped track and reverse damage
- Transparency about failures prevents future incidents

## Preventive Measures Implemented

### Technical Controls
1. **PDF Text Extraction Script** (`scripts/extract-pdf-text.cjs`)
   - Extracts PDF text into manageable chunks
   - Preserves source attribution
   - Enables verification

2. **Data Integrity Policy** (added to CLAUDE.md)
   - Mandatory source verification
   - No synthetic data policy
   - Extraction validation checklist

3. **Real Data File** (`REAL_EXPECTATIONS_ONLY.json`)
   - Contains only verified extractions
   - Clear naming to prevent confusion
   - Metadata tracks source documents

### Process Improvements
1. **Verification Requirements**
   - Every expectation must have verifiable source
   - Include page numbers when possible
   - Validate against known patterns

2. **Extraction Workflow**
   - First extract text from PDFs
   - Then process text chunks with AI
   - Always maintain source traceability

3. **Documentation Standards**
   - Document all extraction attempts
   - Track failures explicitly
   - Maintain incident log

## Recommendations for Future

### Immediate Actions
1. ✅ Delete all synthetic data (COMPLETED)
2. ✅ Create PDF extraction tools (COMPLETED)
3. ✅ Document incident (COMPLETED)
4. ⏳ Process PR 2766 text chunks to extract real data
5. ⏳ Validate all existing extractions

### Long-term Improvements
1. Implement automated validation pipeline
2. Add source verification to all extraction scripts
3. Create test suite for extraction accuracy
4. Regular audits of extracted data
5. Version control for curriculum data with clear provenance

## Conclusion

This incident demonstrates the critical importance of data integrity in educational systems. While AI can be powerful for processing curriculum documents, it must always work with actual source material, not assumptions or prompts alone.

The swift detection and remediation prevented this synthetic data from being used in production. However, the incident serves as a crucial reminder that **educational data integrity is paramount** - we are dealing with content that shapes how children learn.

## Status
- **Incident**: RESOLVED
- **Data**: CLEANED (48 real expectations remain)
- **Systems**: IMPROVED (PDF extraction now functional)
- **Risk**: MITIGATED (policies and tools in place)

---

*Report prepared by: Claude Code*  
*Date: 2025-08-08*  
*Severity: CRITICAL*  
*Category: Data Integrity*