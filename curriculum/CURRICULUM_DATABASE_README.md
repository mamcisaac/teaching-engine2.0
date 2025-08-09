# PEI Grade 1 Complete Curriculum Database

## Overview
This database contains the complete curriculum expectations for Grade 1 in Prince Edward Island's French Immersion program, including both French and English language expectations.

## Database Statistics
- **Total Expectations**: 68
- **Languages**: French (44) and English (24)
- **Data Integrity**: 100% verified from source PDFs
- **Extraction Date**: 2025-08-09
- **Version**: 2.0.0

## Subject Coverage

### French Language Subjects
- **Français langue première**: 15 expectations
  - Communication orale (7)
  - Lecture et visionnement (5)
  - Écriture et représentation (3)
- **Mathématiques**: 3 expectations
- **Sciences de la nature**: 5 expectations
- **Études sociales**: 13 expectations
- **Arts visuels**: 4 expectations
- **Formation personnelle et sociale**: 4 expectations

### English Language Subjects
- **Health Education**: 14 expectations (Wellness Choices)
- **Physical Education**: 10 expectations
  - Health-Related Fitness
  - Active Living
  - Movement Skills
  - Games and Cooperation

## File Structure

```
curriculum/
├── PEI_GRADE1_COMPLETE_CURRICULUM.json    # Master database (all expectations)
├── subjects/                               # Subject-specific exports
│   ├── FRANCAIS_GRADE1.json              # French language arts
│   ├── MATHEMATIQUES_GRADE1.json         # Mathematics
│   ├── SCIENCES_GRADE1.json              # Natural sciences
│   ├── ETUDES_SOCIALES_GRADE1.json       # Social studies
│   ├── ARTS_GRADE1.json                  # Visual arts
│   ├── FORMATION_PERSONNELLE_GRADE1.json # Personal development
│   ├── HEALTH_GRADE1.json                # Health education
│   └── PHYSICAL_EDUCATION_GRADE1.json    # Physical education
└── validation/
    └── CURRICULUM_VALIDATION.json         # Data quality metrics

archive/                                    # Source extraction files
```

## JSON Structure

Each expectation follows this standardized structure:

```json
{
  "code": "1CO.1",                        // Unique identifier
  "description": "Full expectation text",  // Complete description
  "subject": "Subject name",              // Subject area
  "strand": "Strand/domain",              // Curriculum strand
  "grade": 1,                             // Grade level
  "language": "FR|EN",                    // Language of instruction
  "source": {
    "document": "Source PDF name",        // Original document
    "page": null                          // Page reference if available
  },
  "indicators": ["array of indicators"],   // Learning indicators
  "examples": "Examples text",            // Usage examples
  "cross_curricular": [],                 // Cross-curricular links
  "verified": true                        // Data verification status
}
```

## How to Use

### Query All Expectations
```javascript
const curriculum = require('./PEI_GRADE1_COMPLETE_CURRICULUM.json');
const allExpectations = curriculum.expectations;
```

### Query by Subject
```javascript
const frenchExpectations = curriculum.bySubject['Français langue première'];
```

### Query by Language
```javascript
const frenchLanguage = curriculum.expectations.filter(e => e.language === 'FR');
const englishLanguage = curriculum.expectations.filter(e => e.language === 'EN');
```

### Load Subject-Specific File
```javascript
const mathCurriculum = require('./subjects/MATHEMATIQUES_GRADE1.json');
```

## Data Sources

All expectations extracted from official PEI curriculum documents:
- PR 2766 - Programme d'immersion 1re année (French language)
- Grade 1 Health Curriculum (Health education)
- K-6 Physical Education Curriculum (PE expectations)
- 1re année TABLEAUX CUMULATIFS DES RAS
- 2019 RAFs en un coup d'oeil
- Planification d'unité documents (Units 1-4)
- 1re année RAFs Triangulation
- Profil de classe 1re avec changements

## Data Quality Assurance

### Verification Process
1. All expectations extracted from source PDFs
2. Duplicate codes removed
3. Subject names standardized
4. Language classification verified
5. Structure validated

### Quality Metrics
- **With Indicators**: 79% of expectations
- **With Examples**: 43% of expectations
- **Unique Codes**: 100% verified
- **Grade Appropriate**: 100% Grade 1

## Updates and Maintenance

### Adding New Expectations
1. Extract from source PDF
2. Follow standardized JSON structure
3. Add to appropriate subject file
4. Regenerate master database
5. Update validation metrics

### Validation Checks
Run validation to ensure:
- No duplicate codes
- All subjects standardized
- All Grade 1 appropriate
- Source documents traceable

## Integration Notes

### For Teaching Engine 2.0
- Import master database for complete curriculum
- Use subject files for focused teaching modules
- Language field enables bilingual support
- Indicators provide assessment criteria
- Examples support lesson planning

### API Considerations
- Code field serves as unique identifier
- Subject/strand enable filtering
- Language supports content localization
- Source provides traceability

## Known Limitations

### Missing Content
- English Language Arts expectations (separate curriculum needed)
- Cross-curricular connections (Unités transdisciplinaires not fully extracted)
- Some Mathematics expectations (only 3 extracted, more may exist)

### Recommendations
1. Extract Unités transdisciplinaires for complete cross-curricular view
2. Locate dedicated English Language Arts curriculum for Grade 1
3. Review Mathematics coverage for completeness

## License and Attribution
All curriculum content © Prince Edward Island Department of Education
Database structure and extraction © Teaching Engine 2.0

---

*Last Updated: 2025-08-09*
*Version: 2.0.0*