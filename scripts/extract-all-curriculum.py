#!/usr/bin/env python3
"""
Extract ALL curriculum expectations from PEI Grade 1 documents
ONLY real codes from actual PDFs - NO fabrication
"""

import json
import re
import os
from pathlib import Path

# Base path
BASE_PATH = Path("/Users/michaelmcisaac/Github/teaching-engine2.0")

def extract_math_expectations():
    """Extract all Mathematics expectations from eelc_mathfi_1.txt"""
    expectations = []
    
    with open(BASE_PATH / "eelc_mathfi_1.txt", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Pattern for Math codes: 1.N1, 1.RR1, 1.FE1, etc.
    patterns = [
        (r'RAS\s*:\s*(1\.[A-Z]+\d+)\s*:\s*(.+?)(?=\n•|\nRAS|$)', 'multiline'),
        (r'(1\.[A-Z]+\d+)\s+(.+?)(?=\n1\.|$)', 'single')
    ]
    
    found_codes = set()
    
    for pattern, mode in patterns:
        if mode == 'multiline':
            matches = re.findall(pattern, content, re.DOTALL)
        else:
            matches = re.findall(pattern, content)
            
        for code, description in matches:
            if code not in found_codes:
                # Clean up description
                desc = description.strip()
                desc = re.sub(r'\s+', ' ', desc)
                desc = desc.split('\n')[0] if '\n' in desc else desc
                
                expectations.append({
                    "code": code,
                    "description": desc,
                    "subject": "Mathématiques",
                    "grade": 1,
                    "source": "eelc_mathfi_1.txt"
                })
                found_codes.add(code)
    
    return expectations

def extract_french_expectations():
    """Extract French Language Arts expectations from chunks"""
    expectations = []
    found_codes = set()
    
    # Check eelc_frenchimmersion chunks
    chunk_dir = BASE_PATH / "pdf-text-chunks"
    
    # Pattern for French codes: 1CO.O, 1CO.2, 1L.2, etc.
    patterns = [
        r'(1[A-Z]+\.[A-Z0-9]+)\s+(.+?)(?=\n|$)',
        r'(1[A-Z]+\.\d+)\s+(.+?)(?=\n|$)'
    ]
    
    for chunk_file in sorted(chunk_dir.glob("eelc_frenchimmersion_1_chunk_*.txt")):
        with open(chunk_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for code, description in matches:
                if code not in found_codes and code.startswith('1'):
                    desc = description.strip()
                    desc = re.sub(r'\s+', ' ', desc)
                    
                    expectations.append({
                        "code": code,
                        "description": desc,
                        "subject": "Français langue première",
                        "grade": 1,
                        "source": chunk_file.name
                    })
                    found_codes.add(code)
    
    return expectations

def extract_science_expectations():
    """Extract Science expectations from eelc_science chunks"""
    expectations = []
    found_codes = set()
    
    chunk_dir = BASE_PATH / "pdf-text-chunks"
    
    # Pattern for Science codes - need to check actual format
    patterns = [
        r'(1\.\d+\.\d+)\s*[:–]\s*(.+?)(?=\n|$)',
        r'RAS\s*:\s*(1\.\d+\.\d+)\s*[:–]\s*(.+?)(?=\n|$)'
    ]
    
    for chunk_file in sorted(chunk_dir.glob("eelc_science_1_chunk_*.txt")):
        with open(chunk_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for code, description in matches:
                if code not in found_codes:
                    desc = description.strip()
                    desc = re.sub(r'\s+', ' ', desc)
                    
                    expectations.append({
                        "code": code,
                        "description": desc,
                        "subject": "Sciences de la nature",
                        "grade": 1,
                        "source": chunk_file.name
                    })
                    found_codes.add(code)
    
    return expectations

def extract_social_studies_expectations():
    """Extract Social Studies expectations from chunks"""
    expectations = []
    found_codes = set()
    
    chunk_dir = BASE_PATH / "pdf-text-chunks"
    
    # Pattern for Social Studies codes
    patterns = [
        r'(1[A-Z]+\.\d+)\s+(.+?)(?=\n|$)',
        r'(1[A-Z]+\d+)\s+(.+?)(?=\n|$)'
    ]
    
    for chunk_file in sorted(chunk_dir.glob("eelc_socialstudies_1_chunk_*.txt")):
        with open(chunk_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for code, description in matches:
                if code not in found_codes and any(x in code for x in ['C.', 'ICC.', 'LT.', 'PA.', 'ER.']):
                    desc = description.strip()
                    desc = re.sub(r'\s+', ' ', desc)
                    
                    expectations.append({
                        "code": code,
                        "description": desc,
                        "subject": "Sciences humaines",
                        "grade": 1,
                        "source": chunk_file.name
                    })
                    found_codes.add(code)
    
    return expectations

def extract_pe_expectations():
    """Extract Physical Education expectations"""
    expectations = []
    
    with open(BASE_PATH / "phys_ed_curriculum.txt", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find Grade 1 section
    grade1_match = re.search(r'Grade 1.*?(?=Grade 2|$)', content, re.DOTALL)
    if grade1_match:
        grade1_content = grade1_match.group(0)
        
        # Look for PE codes
        patterns = [
            r'([A-Z]-1\.\d+)\s*[:–]\s*(.+?)(?=\n|$)',
            r'(1\.\d+)\s*[:–]\s*(.+?)(?=\n|$)'
        ]
        
        found_codes = set()
        for pattern in patterns:
            matches = re.findall(pattern, grade1_content)
            for code, description in matches:
                if code not in found_codes:
                    desc = description.strip()
                    desc = re.sub(r'\s+', ' ', desc)
                    
                    expectations.append({
                        "code": code,
                        "description": desc,
                        "subject": "Physical Education",
                        "grade": 1,
                        "language": "EN",
                        "source": "phys_ed_curriculum.txt"
                    })
                    found_codes.add(code)
    
    return expectations

def extract_health_expectations():
    """Extract Health expectations"""
    expectations = []
    
    with open(BASE_PATH / "health_curriculum.txt", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find Grade 1 section
    grade1_match = re.search(r'Grade 1.*?(?=Grade 2|$)', content, re.DOTALL)
    if grade1_match:
        grade1_content = grade1_match.group(0)
        
        # Look for Health codes: W-1.x, R-1.x, L-1.x
        patterns = [
            r'([WRL]-1\.\d+)\s*[:–]\s*(.+?)(?=\n|$)'
        ]
        
        found_codes = set()
        for pattern in patterns:
            matches = re.findall(pattern, grade1_content)
            for code, description in matches:
                if code not in found_codes:
                    desc = description.strip()
                    desc = re.sub(r'\s+', ' ', desc)
                    
                    expectations.append({
                        "code": code,
                        "description": desc,
                        "subject": "Health Education",
                        "grade": 1,
                        "language": "EN",
                        "source": "health_curriculum.txt"
                    })
                    found_codes.add(code)
    
    return expectations

def extract_existing_codes():
    """Extract codes from pei_tableaux_cumulatifs.txt"""
    expectations = []
    
    with open(BASE_PATH / "pei_tableaux_cumulatifs.txt", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Arts visuels: AV1-AV4
    # FPS: FPS1-FPS4
    # Sciences: 1.1.1, 1.1.2, etc.
    # Sciences humaines: 1C.1, 1C.2, etc.
    
    patterns = [
        (r'(AV\d)\s+(.+?)(?=\n-|AV\d|$)', 'Arts visuels'),
        (r'(FPS\d)\s+(.+?)(?=\n●|FPS\d|$)', 'Formation personnelle et sociale'),
        (r'(1\.\d+\.\d+)\s+(.+?)(?=\n●|1\.\d+\.\d+|$)', 'Sciences de la nature'),
        (r'(1[A-Z]+\.\d+)\s+(.+?)(?=\n●|1[A-Z]+\.\d+|$)', 'Sciences humaines')
    ]
    
    found_codes = set()
    for pattern, subject in patterns:
        matches = re.findall(pattern, content, re.DOTALL)
        for code, description in matches:
            if code not in found_codes:
                desc = description.strip()
                desc = re.sub(r'\s+', ' ', desc)
                desc = desc.split('●')[0].strip() if '●' in desc else desc
                
                expectations.append({
                    "code": code,
                    "description": desc,
                    "subject": subject,
                    "grade": 1,
                    "source": "pei_tableaux_cumulatifs.txt"
                })
                found_codes.add(code)
    
    return expectations

def main():
    """Main extraction function"""
    
    all_expectations = []
    
    print("Extracting Mathematics expectations...")
    math_exp = extract_math_expectations()
    print(f"  Found {len(math_exp)} Math expectations")
    all_expectations.extend(math_exp)
    
    print("Extracting French Language Arts expectations...")
    french_exp = extract_french_expectations()
    print(f"  Found {len(french_exp)} French expectations")
    all_expectations.extend(french_exp)
    
    print("Extracting Science expectations...")
    science_exp = extract_science_expectations()
    print(f"  Found {len(science_exp)} Science expectations")
    all_expectations.extend(science_exp)
    
    print("Extracting Social Studies expectations...")
    social_exp = extract_social_studies_expectations()
    print(f"  Found {len(social_exp)} Social Studies expectations")
    all_expectations.extend(social_exp)
    
    print("Extracting Physical Education expectations...")
    pe_exp = extract_pe_expectations()
    print(f"  Found {len(pe_exp)} PE expectations")
    all_expectations.extend(pe_exp)
    
    print("Extracting Health expectations...")
    health_exp = extract_health_expectations()
    print(f"  Found {len(health_exp)} Health expectations")
    all_expectations.extend(health_exp)
    
    print("Extracting existing coded expectations...")
    existing_exp = extract_existing_codes()
    print(f"  Found {len(existing_exp)} existing expectations")
    all_expectations.extend(existing_exp)
    
    # Remove duplicates based on code
    unique_expectations = {}
    for exp in all_expectations:
        code = exp['code']
        if code not in unique_expectations:
            unique_expectations[code] = exp
    
    # Separate by language/stream
    french_immersion = []
    english_stream = []
    
    for exp in unique_expectations.values():
        if exp.get('language') == 'EN' or exp['subject'] in ['Health Education', 'Physical Education']:
            # Check if it's actually for French Immersion
            if exp['subject'] == 'Physical Education':
                # PE might be taught in English even in French Immersion
                french_immersion.append(exp)
            else:
                english_stream.append(exp)
        else:
            french_immersion.append(exp)
    
    # Create output structure
    output = {
        "metadata": {
            "title": "PEI Grade 1 Complete Curriculum - Real Extraction",
            "grade": 1,
            "province": "Prince Edward Island",
            "extraction_date": "2025-08-09",
            "total_expectations": len(unique_expectations),
            "french_immersion_count": len(french_immersion),
            "english_stream_count": len(english_stream)
        },
        "french_immersion": sorted(french_immersion, key=lambda x: (x['subject'], x['code'])),
        "english_stream": sorted(english_stream, key=lambda x: (x['subject'], x['code'])),
        "by_subject": {}
    }
    
    # Group by subject
    for exp in unique_expectations.values():
        subject = exp['subject']
        if subject not in output['by_subject']:
            output['by_subject'][subject] = []
        output['by_subject'][subject].append(exp)
    
    # Sort each subject's expectations
    for subject in output['by_subject']:
        output['by_subject'][subject] = sorted(output['by_subject'][subject], key=lambda x: x['code'])
    
    # Save to file
    output_file = BASE_PATH / "curriculum" / "PEI_GRADE1_COMPLETE_EXTRACTED.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Extraction complete!")
    print(f"Total expectations found: {len(unique_expectations)}")
    print(f"French Immersion: {len(french_immersion)}")
    print(f"English Stream: {len(english_stream)}")
    print(f"Saved to: {output_file}")
    
    # Print summary by subject
    print("\nBy Subject:")
    for subject, exps in output['by_subject'].items():
        print(f"  {subject}: {len(exps)} expectations")

if __name__ == "__main__":
    main()