# PEI Grade 1 French Immersion Curriculum - Extraction TODO

## Current Status

### ✅ Successfully Extracted (32-41 expectations)
- **Français en immersion**: 7 codes extracted from `pei_rafs_triangulation.txt`
- **Mathématiques**: ~14 codes extracted from `eelc_mathfi_1.txt`  
- **Sciences de la nature**: 5 codes extracted from `pei_tableaux_cumulatifs.txt`
- **Sciences humaines**: 7 codes extracted from `pei_tableaux_cumulatifs.txt`
- **Arts visuels**: 4 codes extracted from `pei_tableaux_cumulatifs.txt`
- **Formation personnelle et sociale**: 4 codes extracted from `pei_tableaux_cumulatifs.txt`

### ❌ Needs Extraction

## 1. Physical Education / Éducation physique

**Source Files Available:**
- `resources/PE_Grade1_Fr/eelc_physed_k-6.pdf` - Official PE curriculum
- `resources/PE_Grade1_Fr/education_physique_m-6.pdf` - Comprehensive PE guide
- `phys_ed_curriculum.txt` - Already extracted text (107KB)

**What to Extract:**
- Look for "Grade 1 Physical Education Outcomes and Indicators" (mentioned on page 58)
- Extract General Curriculum Outcomes (GCOs)
- Extract Specific Curriculum Outcomes (SCOs) 
- Look for codes like "1.1", "1.2" or "PE1.x" format
- Focus on movement skills, active living, relationships sections

**Known Structure (from table of contents):**
- Page 58: Grade 1 Physical Education Outcomes and Indicators
- Likely includes locomotor skills, non-locomotor skills, manipulative skills

## 2. Health / Santé

**Source Files Available:**
- `resources/PE_Grade1_Fr/eelc_health_1.pdf` - Grade 1 Health curriculum
- `health_curriculum.txt` - Already extracted text (65KB)
- `mental_health_curriculum.txt` - Mental health component (116KB)

**What to Extract:**
- Wellness outcomes (codes likely W-1.x)
- Relationship outcomes (codes likely R-1.x)
- Life Learning Choices outcomes (codes likely L-1.x)
- Look for "Grade 1 Health Education Outcomes"

**Expected Topics:**
- Personal wellness and safety
- Healthy relationships
- Mental and emotional health
- Growth and development

## 3. Music / Musique

**Source Files Available:**
- `resources/PE_Grade1_Fr/k-3musiccurricula.pdf` - K-3 Music curriculum

**What to Extract:**
- Grade 1 specific music outcomes
- Look for codes in format like "MU1.x" or "1.M.x"
- General Curriculum Outcomes (GCOs) for Grade 1
- Specific Curriculum Outcomes (SCOs) for Grade 1

**Expected Strands:**
- Creating, Making, and Presenting
- Understanding and Connecting Contexts
- Perceiving, Reflecting, and Responding

## 4. Technology / Technologie

**Source Files Available:**
- `resources/PE_Grade1_Fr/eelc_comm_it_1.pdf` - Communication and Information Technology

**What to Extract:**
- Digital citizenship outcomes
- Basic computer skills outcomes  
- Information literacy outcomes
- Look for codes like "CIT1.x" or "1.T.x"

**Expected Topics:**
- Basic computer operations
- Digital citizenship and safety
- Using technology for learning
- Creating with technology

## 5. Additional French Language Arts

**Potential Additional Codes:**
- Need to verify if 1CO.1, 1CO.3, 1CO.4, 1CO.6 actually exist
- Need to verify if 1L.1, 1L.5 actually exist
- Need to verify if 1É.1, 1É.3 actually exist
- Check `resources/PE_Grade1_Fr/eelc_frenchimmersion_1.pdf` for complete list

## 6. Complete Mathematics Extraction

**Source:** `eelc_mathfi_1.txt` (already have text)

**Still Need:**
- Complete list of 1.RR codes (Régularités et relations)
- Complete list of 1.FE codes (Forme et espace)
- Verify we have all 1.N codes (currently have 1.N1-1.N9)

## Extraction Guidelines

### DO:
- Extract ONLY codes that explicitly appear in documents
- Include the exact French wording from the documents
- Note the source document and page/line number
- Preserve the original code format (don't change 1CO.O to 1CO.0)
- Include indicators/descriptors when available

### DON'T:
- Make up codes that seem logical but don't exist
- Assume code patterns (like if 1.1 exists, 1.2 must exist)
- Translate from English if only English version exists
- Add expectations from other grades
- Create generic descriptions

## How to Extract

### Manual Method:
1. Open the PDF or text file
2. Search for "Grade 1" or "1re année"
3. Look for sections with "Outcomes", "Résultats", "RAS", or "Expectations"
4. Copy the exact code and description
5. Note the source location

### Automated Method:
```python
import re

# For codes like 1.N1, 1.RR1, etc.
pattern1 = r'(1\.[A-Z]+\d+)\s*:\s*(.+?)(?=\n|$)'

# For codes like 1CO.2, 1L.3, etc.  
pattern2 = r'(1[A-Z]+\.\d+)\s+(.+?)(?=\n|$)'

# For codes like AV1, FPS1, etc.
pattern3 = r'^([A-Z]+\d)\s+(.+?)(?=\n|$)'
```

## Priority Order

1. **Physical Education** - Have text file, just needs code extraction
2. **Health** - Have text file, just needs code extraction  
3. **Complete Math** - Verify all RR and FE codes are extracted
4. **Music** - Need to extract from PDF
5. **Technology** - Need to extract from PDF

## Validation Checklist

Before adding any expectation:
- [ ] Code appears explicitly in source document
- [ ] Description is copied exactly from source
- [ ] Source file and location documented
- [ ] Code format preserved from original
- [ ] French version available (for immersion context)
- [ ] Not duplicating existing expectation
- [ ] Not inventing plausible-sounding codes

## Final Goal

Complete, accurate PEI Grade 1 French Immersion curriculum with:
- Every expectation that exists in official documents
- Zero fabricated or assumed expectations
- Clear documentation of sources
- Honest accounting of what's available vs missing

## Files to Update

When new expectations are found:
1. Add to `REAL-PEI-CURRICULUM-ONLY.json`
2. Update `load-real-pei-curriculum.js` if needed
3. Document in this file that extraction is complete
4. Update counts in documentation

## Contact for Source Documents

If official documents are missing:
- PEI Department of Education and Early Childhood Development
- https://www.princeedwardisland.ca/en/topic/curriculum
- Check for French Immersion specific documents

---

*Last Updated: 2025-08-09*
*Status: ~32-41 of estimated 80-100 expectations extracted*