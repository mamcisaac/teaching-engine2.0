# Step-by-Step Extraction Instructions

## Physical Education Extraction

### Step 1: Open phys_ed_curriculum.txt
```bash
grep -n "Grade 1" phys_ed_curriculum.txt
# Should find section around line 58
```

### Step 2: Look for Outcome Patterns
Search for these patterns:
- "Outcome 1.1"
- "GCO" (General Curriculum Outcome)
- "SCO" (Specific Curriculum Outcome)  
- "Students will"
- "L'élève"

### Step 3: Expected Structure
```
Grade 1 Physical Education
├── Active Living
│   ├── 1.1 Participate daily in physical activity
│   └── 1.2 Identify benefits of physical activity
├── Skillful Movement
│   ├── 1.3 Perform locomotor skills
│   ├── 1.4 Perform non-locomotor skills
│   └── 1.5 Perform manipulative skills
└── Relationships
    ├── 1.6 Work cooperatively
    └── 1.7 Show respect for others
```

### Step 4: Extract Command
```bash
# Extract lines containing Grade 1 outcomes
grep -A 10 -B 2 "Grade 1" phys_ed_curriculum.txt > grade1_pe_outcomes.txt

# Look for specific outcome patterns
grep -E "1\.[0-9]|Outcome.*1|Grade 1.*will" phys_ed_curriculum.txt
```

## Health Education Extraction

### Step 1: Search health_curriculum.txt
```bash
# Find Grade 1 section
grep -n "Grade 1\|1re année" health_curriculum.txt

# Find outcome codes
grep -E "W-1\.|R-1\.|L-1\." health_curriculum.txt
```

### Step 2: Expected Outcomes
- **Wellness (W-1.x)**
  - W-1.1: Understanding wellness
  - W-1.2: Personal safety
  - W-1.3: Healthy habits

- **Relationships (R-1.x)**
  - R-1.1: Healthy relationships
  - R-1.2: Communication skills
  - R-1.3: Respect for diversity

- **Life Learning (L-1.x)**
  - L-1.1: Decision making
  - L-1.2: Goal setting

### Step 3: Extraction Pattern
```python
import re

with open('health_curriculum.txt', 'r') as f:
    text = f.read()
    
# Pattern for health codes
health_pattern = r'([WRL]-1\.\d+)[:\s]+(.+?)(?=\n|$)'
matches = re.findall(health_pattern, text)

for code, description in matches:
    print(f"{code}: {description}")
```

## Music Extraction

### Step 1: Extract text from PDF
```bash
# If pdftotext is available
pdftotext resources/PE_Grade1_Fr/k-3musiccurricula.pdf music_curriculum.txt

# Or use Python
python3 << 'EOF'
import pdfplumber
with pdfplumber.open('resources/PE_Grade1_Fr/k-3musiccurricula.pdf') as pdf:
    text = ''
    for page in pdf.pages:
        text += page.extract_text() + '\n'
    with open('music_curriculum.txt', 'w') as f:
        f.write(text)
EOF
```

### Step 2: Search for Grade 1 Music Outcomes
Look for:
- "Grade 1 Music"
- "Creating, Making, and Presenting"
- "Understanding and Connecting"
- "Perceiving and Responding"

### Step 3: Expected Format
```
1.CM.1 - Create simple rhythmic patterns
1.CM.2 - Explore vocal sounds
1.UC.1 - Identify music in daily life
1.UC.2 - Recognize different musical styles
1.PR.1 - Respond to music through movement
1.PR.2 - Express preferences about music
```

## Technology Extraction

### Step 1: Extract from eelc_comm_it_1.pdf
```bash
# Extract text first
pdftotext resources/PE_Grade1_Fr/eelc_comm_it_1.pdf technology_curriculum.txt
```

### Step 2: Search Patterns
```bash
# Look for Grade 1 technology outcomes
grep -E "Grade 1|1\.|CIT.*1|Technology.*1" technology_curriculum.txt
```

### Step 3: Expected Topics
- Digital Citizenship
- Basic Operations
- Creating and Communicating
- Research and Information

## Verification Script

Create `verify_extraction.py`:
```python
#!/usr/bin/env python3
import json
import re

def verify_curriculum():
    with open('REAL-PEI-CURRICULUM-ONLY.json', 'r') as f:
        data = json.load(f)
    
    total = 0
    for subject, expectations in data['curriculum'].items():
        count = len(expectations)
        total += count
        print(f"{subject}: {count} expectations")
        
        # Check for duplicates
        codes = [e['code'] for e in expectations]
        if len(codes) != len(set(codes)):
            print(f"  WARNING: Duplicates in {subject}")
        
        # Check for patterns
        for exp in expectations:
            if 'source' not in exp:
                print(f"  WARNING: No source for {exp['code']}")
    
    print(f"\nTotal: {total} expectations")
    
    # Check against source files
    print("\nVerifying against source files...")
    
    # Check math codes
    with open('eelc_mathfi_1.txt', 'r') as f:
        math_text = f.read()
        for code in ['1.N1', '1.N2', '1.N3', '1.N4', '1.N5']:
            if code in math_text:
                print(f"✓ {code} found in math source")
            else:
                print(f"✗ {code} NOT found in math source")

if __name__ == '__main__':
    verify_curriculum()
```

## Quality Checklist

For each extracted expectation:

### Required Fields
- [ ] `code` - Exact code from document
- [ ] `description` - Exact text from document  
- [ ] `strand` - Subject area/domain
- [ ] `source` - File name and line/page number

### Validation
- [ ] Code exists verbatim in source
- [ ] Description is complete (not truncated)
- [ ] French version for immersion context
- [ ] No assumptions or interpretations
- [ ] No codes from other grades

### Red Flags - DO NOT ADD if:
- Code "seems like it should exist" but isn't in document
- Description is translated/paraphrased 
- Pattern-matching suggests code (e.g., "if 1.1 exists, 1.2 must too")
- Code is from different grade or province
- Only English version available (need French for immersion)

## Command Summary

```bash
# Quick extraction workflow
cd /Users/michaelmcisaac/GitHub/teaching-engine2.0

# 1. Search for Grade 1 content
grep -n "Grade 1\|1re année" *.txt

# 2. Extract specific patterns
grep -E "1\.[A-Z]+[0-9]|[A-Z]+-1\.[0-9]" *.txt > found_codes.txt

# 3. Verify in source
for code in $(cat found_codes.txt | cut -d: -f1); do
  echo "Checking $code..."
  grep -n "$code" pei_*.txt eelc_*.txt
done

# 4. Update JSON
# Add only verified codes to REAL-PEI-CURRICULUM-ONLY.json

# 5. Test loading
node load-real-pei-curriculum.js
```

## Remember

**Better to have 32 real expectations than 100 with fabrications.**

Every code must be traceable to a specific line in a specific PEI document.