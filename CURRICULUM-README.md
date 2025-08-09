# PEI Grade 1 French Immersion Curriculum

## ⚠️ IMPORTANT NOTICE

This repository contains ONLY verified curriculum expectations extracted from official PEI documents. Previous versions contained fabricated data which has been removed.

## Current Status

### ✅ Verified Content (32-41 expectations)
- Real curriculum codes from official PEI documents
- Each expectation traceable to source file and location
- French descriptions for immersion context

### ❌ Not Included
- No fabricated codes
- No assumed patterns
- No invented expectations
- Missing: PE, Health, Music, Technology (extraction pending)

## Files

### Data Files
- `REAL-PEI-CURRICULUM-ONLY.json` - Contains ONLY verified expectations
- `CRITICAL-ASSESSMENT-REPORT.md` - Documents what was real vs fabricated
- `CURRICULUM-EXTRACTION-TODO.md` - What still needs extraction
- `EXTRACTION-INSTRUCTIONS.md` - How to extract remaining curriculum
- `LESSONS-LEARNED.md` - Important lessons from this process

### Source Documents
- `resources/PE_Grade1_Fr/*.pdf` - 17 official PEI curriculum PDFs
- `pei_*.txt` - Extracted text from key documents
- `eelc_mathfi_1.txt` - Mathematics curriculum text
- `health_curriculum.txt`, `phys_ed_curriculum.txt` - Need code extraction

### Scripts
- `load-real-pei-curriculum.js` - Loads verified curriculum into database

## Usage

### Load Curriculum into Database
```bash
node load-real-pei-curriculum.js
```

This will load ~32-41 real expectations into the database.

### Verify Content
```bash
# Check what's in the JSON
grep '"code":' REAL-PEI-CURRICULUM-ONLY.json | wc -l

# Verify against source
grep "1.N1" eelc_mathfi_1.txt  # Should find math code
grep "1CO.O" pei_rafs_triangulation.txt  # Should find French code
```

## What's Real

### Français en immersion (7 codes)
- 1CO.O, 1CO.2, 1CO.5 - Communication orale
- 1L.2, 1L.3, 1L.4 - Lecture et visionnement
- 1É.2 - Écriture et représentation

### Mathématiques (~14 codes)
- 1.N1 to 1.N9 - Le nombre
- 1.RR1 to 1.RR3 - Régularités et relations
- 1.FE1, 1.FE2 - Forme et espace

### Sciences de la nature (5 codes)
- 1.1.1, 1.1.2 - Sciences de la vie
- 1.2.1 - Sciences physiques
- 1.3.1, 1.3.2 - Sciences de la Terre et de l'espace

### Sciences humaines (7 codes)
- 1C.1, 1C.2 - Citoyenneté
- 1ICC.1 - Identité, culture et communauté
- 1LT.1, 1LT.2 - Lieux et temps
- 1PA.1 - Pouvoir et autorité
- 1ER.1 - Économie et ressources

### Arts visuels (4 codes)
- AV1, AV2, AV3, AV4

### Formation personnelle et sociale (4 codes)
- FPS1, FPS2, FPS3, FPS4

## What's Fake (DO NOT USE)

These codes were fabricated and do not exist:
- ❌ French: 1CO.1, 1CO.3, 1CO.4, 1CO.6, 1L.1, 1L.5, 1É.1, 1É.3
- ❌ Math: 1.N10
- ❌ Social Studies: SS1.1-SS1.5 (wrong format)
- ❌ PE: PE1.1-PE1.5 (no source)
- ❌ Health: W-1.1-W-1.3, R-1.1-R-1.2 (not verified)
- ❌ Music: MU1.1-MU1.4 (no source)
- ❌ Technology: CIT1.1-CIT1.4 (no source)

## Contributing

If you want to help extract the remaining curriculum:

1. Read `EXTRACTION-INSTRUCTIONS.md`
2. Choose a subject that needs extraction
3. Find the codes in the source documents
4. Verify each code exists verbatim
5. Add to `REAL-PEI-CURRICULUM-ONLY.json` with source reference
6. Submit PR with evidence of verification

### Rules for Contributors
- **NO FABRICATION** - Only add codes that exist in documents
- **EXACT COPY** - Use exact wording from source
- **SOURCE REQUIRED** - Include file:line reference
- **FRENCH ONLY** - This is French Immersion curriculum
- **VERIFY EVERYTHING** - Double-check before adding

## Integrity Statement

This curriculum data has been audited and verified. We guarantee:
- Every code exists in official PEI documents
- Every description is copied exactly from source
- No fabricated or assumed content
- Clear documentation of what's missing

Previous versions contained ~40% fabricated data. This has been completely removed.

## Contact

For official PEI curriculum documents:
- [PEI Department of Education](https://www.princeedwardisland.ca/en/topic/curriculum)
- Look for "Grade 1 French Immersion" documents

## License

The curriculum content belongs to PEI Department of Education and Early Childhood Development.
This extraction is for educational use.

---

**Remember: Data integrity is more important than completeness. We only include what's real.**